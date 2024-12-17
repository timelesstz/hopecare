import { prisma } from '@/lib/prisma';
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

interface DeepLearningPrediction {
  value: number;
  confidence: number;
  attention: number[];
  embedding: number[];
}

export class TransformerModel {
  private model: tf.LayersModel;
  private readonly numHeads = 8;
  private readonly dModel = 64;
  private readonly dff = 256;
  private readonly maxLength = 50;

  async build() {
    const input = tf.input({ shape: [this.maxLength, this.dModel] });
    
    // Multi-head attention layer
    const attention = tf.layers.multiHeadAttention({
      numHeads: this.numHeads,
      keyDim: this.dModel / this.numHeads,
    });
    
    // Feed-forward network
    const ffn = tf.sequential({
      layers: [
        tf.layers.dense({ units: this.dff, activation: 'relu' }),
        tf.layers.dense({ units: this.dModel }),
      ],
    });

    // Layer normalization
    const layerNorm1 = tf.layers.layerNormalization();
    const layerNorm2 = tf.layers.layerNormalization();

    // Build transformer block
    const attOutput = attention.apply(input) as tf.SymbolicTensor;
    const out1 = layerNorm1.apply(
      tf.layers.add().apply([input, attOutput])
    ) as tf.SymbolicTensor;
    
    const ffnOutput = ffn.apply(out1) as tf.SymbolicTensor;
    const out2 = layerNorm2.apply(
      tf.layers.add().apply([out1, ffnOutput])
    ) as tf.SymbolicTensor;

    // Output layer
    const globalAvg = tf.layers.globalAveragePooling1D().apply(out2) as tf.SymbolicTensor;
    const output = tf.layers.dense({ units: 1 }).apply(globalAvg) as tf.SymbolicTensor;

    this.model = tf.model({ inputs: input, outputs: output });
    
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mse'],
    });
  }

  async train(features: number[][], labels: number[], epochs = 50) {
    const xs = tf.tensor3d(this.padSequences(features, this.maxLength));
    const ys = tf.tensor2d(labels.map(l => [l]));

    const history = await this.model.fit(xs, ys, {
      epochs,
      validationSplit: 0.2,
      callbacks: tfvis.show.fitCallbacks(
        { name: 'Training Performance' },
        ['loss', 'mse'],
        { height: 200, callbacks: ['onEpochEnd'] }
      ),
    });

    return history;
  }

  async predict(features: number[][]): Promise<DeepLearningPrediction> {
    const input = tf.tensor3d(this.padSequences([features], this.maxLength));
    const prediction = this.model.predict(input) as tf.Tensor;
    const value = (await prediction.data())[0];

    // Get attention weights for interpretability
    const attentionLayer = this.model.getLayer('multi_head_attention');
    const attentionWeights = await this.getAttentionWeights(attentionLayer, input);

    // Get embeddings for feature importance
    const embeddingLayer = this.model.getLayer('global_average_pooling1d');
    const embedding = await this.getEmbedding(embeddingLayer, input);

    return {
      value,
      confidence: this.calculateConfidence(attentionWeights),
      attention: Array.from(attentionWeights),
      embedding: Array.from(embedding),
    };
  }

  private padSequences(sequences: number[][], maxLen: number): number[][] {
    return sequences.map(seq => {
      if (seq.length > maxLen) {
        return seq.slice(0, maxLen);
      }
      return [...seq, ...new Array(maxLen - seq.length).fill(0)];
    });
  }

  private async getAttentionWeights(layer: tf.layers.Layer, input: tf.Tensor): Promise<Float32Array> {
    const attentionModel = tf.model({
      inputs: this.model.input,
      outputs: layer.output,
    });
    const attentionOutput = attentionModel.predict(input) as tf.Tensor;
    return attentionOutput.mean([1, 2]).dataSync();
  }

  private async getEmbedding(layer: tf.layers.Layer, input: tf.Tensor): Promise<Float32Array> {
    const embeddingModel = tf.model({
      inputs: this.model.input,
      outputs: layer.output,
    });
    const embedding = embeddingModel.predict(input) as tf.Tensor;
    return embedding.dataSync();
  }

  private calculateConfidence(attentionWeights: Float32Array): number {
    const maxAttention = Math.max(...Array.from(attentionWeights));
    return 1 / (1 + Math.exp(-maxAttention)); // Sigmoid of max attention
  }
}

export class AutoEncoder {
  private encoder: tf.LayersModel;
  private decoder: tf.LayersModel;
  private fullModel: tf.LayersModel;
  private readonly latentDim = 32;

  async build(inputDim: number) {
    // Encoder
    const encoderInput = tf.input({ shape: [inputDim] });
    const encoded = tf.sequential({
      layers: [
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: this.latentDim, activation: 'relu' }),
      ],
    }).apply(encoderInput) as tf.SymbolicTensor;

    // Decoder
    const decoderInput = tf.input({ shape: [this.latentDim] });
    const decoded = tf.sequential({
      layers: [
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: inputDim, activation: 'sigmoid' }),
      ],
    }).apply(decoderInput) as tf.SymbolicTensor;

    // Create separate encoder and decoder models
    this.encoder = tf.model({ inputs: encoderInput, outputs: encoded });
    this.decoder = tf.model({ inputs: decoderInput, outputs: decoded });

    // Create full autoencoder
    const fullOutput = this.decoder.apply(
      this.encoder.apply(encoderInput)
    ) as tf.SymbolicTensor;
    
    this.fullModel = tf.model({ inputs: encoderInput, outputs: fullOutput });
    
    this.fullModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
    });
  }

  async train(data: number[][], epochs = 50) {
    const xs = tf.tensor2d(data);

    const history = await this.fullModel.fit(xs, xs, {
      epochs,
      validationSplit: 0.2,
      callbacks: tfvis.show.fitCallbacks(
        { name: 'Autoencoder Training' },
        ['loss'],
        { height: 200, callbacks: ['onEpochEnd'] }
      ),
    });

    return history;
  }

  async encode(data: number[][]): Promise<number[][]> {
    const xs = tf.tensor2d(data);
    const encoded = this.encoder.predict(xs) as tf.Tensor;
    return encoded.arraySync() as number[][];
  }

  async decode(encoded: number[][]): Promise<number[][]> {
    const xs = tf.tensor2d(encoded);
    const decoded = this.decoder.predict(xs) as tf.Tensor;
    return decoded.arraySync() as number[][];
  }

  async detectAnomalies(data: number[][], threshold = 0.1): Promise<boolean[]> {
    const xs = tf.tensor2d(data);
    const reconstructed = this.fullModel.predict(xs) as tf.Tensor;
    const losses = tf.losses.meanSquaredError(xs, reconstructed);
    const lossValues = await losses.array();
    return lossValues.map(loss => loss > threshold);
  }
}

export class DeepLearningPipeline {
  private transformer: TransformerModel;
  private autoencoder: AutoEncoder;

  constructor() {
    this.transformer = new TransformerModel();
    this.autoencoder = new AutoEncoder();
  }

  async initialize(inputDim: number) {
    await this.transformer.build();
    await this.autoencoder.build(inputDim);
  }

  async train(data: number[][], labels: number[]) {
    // Train autoencoder for feature extraction and anomaly detection
    await this.autoencoder.train(data);
    
    // Use encoded features for transformer training
    const encodedFeatures = await this.autoencoder.encode(data);
    await this.transformer.train(encodedFeatures, labels);
  }

  async predict(features: number[][]) {
    // Check for anomalies
    const anomalies = await this.autoencoder.detectAnomalies(features);
    
    // Get encoded features
    const encoded = await this.autoencoder.encode(features);
    
    // Make prediction
    const prediction = await this.transformer.predict(encoded);

    return {
      ...prediction,
      anomalies,
      encoded,
    };
  }

  async analyzeFeatures(features: number[][]) {
    const encoded = await this.autoencoder.encode(features);
    const decoded = await this.autoencoder.decode(encoded);
    
    return {
      encoded,
      decoded,
      reconstructionError: tf.losses.meanSquaredError(
        tf.tensor2d(features),
        tf.tensor2d(decoded)
      ).arraySync(),
    };
  }
}
