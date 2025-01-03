export type BlockType = 
  | 'section'
  | 'heading'
  | 'text'
  | 'image'
  | 'button'
  | 'columns'
  | 'list'
  | 'quote'
  | 'video'
  | 'divider'
  | 'spacer'
  | 'icon'
  | 'gallery'
  | 'testimonial'
  | 'form'
  | 'map'
  | 'social';

export interface BlockStyles {
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  boxShadow?: string;
  width?: string;
  height?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  [key: string]: any;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  settings?: {
    columns?: number;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    listType?: 'bullet' | 'number';
    buttonType?: 'primary' | 'secondary' | 'outline';
    buttonSize?: 'small' | 'medium' | 'large';
    imageSize?: 'small' | 'medium' | 'large' | 'full';
    videoProvider?: 'youtube' | 'vimeo';
    iconName?: string;
    iconSize?: 'small' | 'medium' | 'large';
    [key: string]: any;
  };
  styles?: BlockStyles;
}