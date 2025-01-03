import prisma from './prisma';

export const analyticsService = {
  async trackPageView(page: string) {
    return prisma.analytics.create({
      data: {
        type: 'PAGE_VIEW',
        value: 1,
      },
    });
  },

  async getPageViews(startDate: Date, endDate: Date) {
    return prisma.analytics.findMany({
      where: {
        type: 'PAGE_VIEW',
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  },

  async getContentStats() {
    const [pages, posts, programs] = await Promise.all([
      prisma.content.count({ where: { type: 'page' } }),
      prisma.content.count({ where: { type: 'post' } }),
      prisma.content.count({ where: { type: 'program' } }),
    ]);

    return { pages, posts, programs };
  },

  async getUserStats() {
    const [totalUsers, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
    ]);

    return { totalUsers, activeUsers };
  },

  async getMediaStats() {
    const totalMedia = await prisma.media.count();
    const totalSize = await prisma.media.aggregate({
      _sum: {
        size: true,
      },
    });

    return {
      totalFiles: totalMedia,
      totalSize: totalSize._sum.size || 0,
    };
  },
};
