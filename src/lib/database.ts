import Dexie, { Table } from 'dexie';
import { Build, Photo, PostContent, ContentTemplate, CalendarEvent } from '@/types';

export class LuthierDatabase extends Dexie {
  builds!: Table<Build>;
  photos!: Table<Photo>;
  postContents!: Table<PostContent>;
  contentTemplates!: Table<ContentTemplate>;
  calendarEvents!: Table<CalendarEvent>;

  constructor() {
    super('LuthierGramDB');
    
    this.version(1).stores({
      builds: 'id, name, woodType, style, startDate, clientName, createdAt, updatedAt',
      photos: 'id, googlePhotoId, buildId, timestamp, filename, posted, scheduledDate',
      postContents: 'photoId, scheduledDate, buildContext.buildName',
      contentTemplates: 'id, name, stage',
      calendarEvents: 'id, date, photo.id, build.id'
    });
  }
}

export const db = new LuthierDatabase();

// Build CRUD operations
export const buildOperations = {
  // Create a new build
  async create(buildData: Omit<Build, 'id' | 'photos' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const build: Build = {
      ...buildData,
      id: crypto.randomUUID(),
      photos: [],
      createdAt: now,
      updatedAt: now
    };
    
    await db.builds.add(build);
    return build.id;
  },

  // Get all builds
  async getAll(): Promise<Build[]> {
    return await db.builds.orderBy('createdAt').reverse().toArray();
  },

  // Get build by ID
  async getById(id: string): Promise<Build | undefined> {
    return await db.builds.get(id);
  },

  // Update build
  async update(id: string, updates: Partial<Build>): Promise<void> {
    await db.builds.update(id, { 
      ...updates, 
      updatedAt: new Date() 
    });
  },

  // Delete build
  async delete(id: string): Promise<void> {
    // Also remove all photos associated with this build
    await db.photos.where('buildId').equals(id).modify({});
    await db.builds.delete(id);
  },

  // Search builds
  async search(query: string): Promise<Build[]> {
    const searchTerm = query.toLowerCase();
    return await db.builds
      .filter(build => 
        build.name.toLowerCase().includes(searchTerm) ||
        build.woodType.toLowerCase().includes(searchTerm) ||
        build.style.toLowerCase().includes(searchTerm) ||
        (build.clientName?.toLowerCase().includes(searchTerm) ?? false)
      )
      .toArray();
  },

  // Filter builds
  async filter(filters: {
    woodType?: string;
    style?: string;
    clientName?: string;
  }): Promise<Build[]> {
    let collection = db.builds.toCollection();
    
    if (filters.woodType) {
      collection = collection.filter(build => build.woodType === filters.woodType);
    }
    if (filters.style) {
      collection = collection.filter(build => build.style === filters.style);
    }
    if (filters.clientName) {
      collection = collection.filter(build => build.clientName === filters.clientName);
    }
    
    return await collection.toArray();
  }
};

// Photo CRUD operations
export const photoOperations = {
  // Add photos from Google Photos
  async addFromGoogle(googlePhotos: Photo[]): Promise<void> {
    await db.photos.bulkAdd(googlePhotos);
  },

  // Get all photos
  async getAll(): Promise<Photo[]> {
    return await db.photos.orderBy('timestamp').reverse().toArray();
  },

  // Get photos by build ID
  async getByBuildId(buildId: string): Promise<Photo[]> {
    return await db.photos.where('buildId').equals(buildId).toArray();
  },

  // Get unassigned photos
  async getUnassigned(): Promise<Photo[]> {
    return await db.photos.filter(photo => !photo.buildId).toArray();
  },

  // Assign photo to build
  async assignToBuild(photoId: string, buildId: string): Promise<void> {
    await db.photos.update(photoId, { buildId });
    
    // Update the build's photos array
    const build = await db.builds.get(buildId);
    if (build) {
      const photo = await db.photos.get(photoId);
      if (photo) {
        const updatedPhotos = [...build.photos, photo];
        await db.builds.update(buildId, { 
          photos: updatedPhotos,
          updatedAt: new Date() 
        });
      }
    }
  },

  // Unassign photo from build
  async unassignFromBuild(photoId: string): Promise<void> {
    const photo = await db.photos.get(photoId);
    if (photo && photo.buildId) {
      const buildId = photo.buildId;
      const updates: Partial<Photo> = { buildId: undefined };
      await db.photos.update(photoId, updates);
      
      // Update the build's photos array
      const build = await db.builds.get(buildId);
      if (build) {
        const updatedPhotos = build.photos.filter(p => p.id !== photoId);
        await db.builds.update(buildId, { 
          photos: updatedPhotos,
          updatedAt: new Date() 
        });
      }
    }
  },

  // Bulk assign photos to build
  async bulkAssignToBuild(photoIds: string[], buildId: string): Promise<void> {
    await db.transaction('rw', [db.photos, db.builds], async () => {
      // Update all photos
      for (const photoId of photoIds) {
        await db.photos.update(photoId, { buildId });
      }
      
      // Update build's photos array
      const build = await db.builds.get(buildId);
      if (build) {
        const photos = await db.photos.where('id').anyOf(photoIds).toArray();
        const updatedPhotos = [...build.photos, ...photos];
        await db.builds.update(buildId, { 
          photos: updatedPhotos,
          updatedAt: new Date() 
        });
      }
    });
  },

  // Update photo
  async update(photoId: string, updates: Partial<Photo>): Promise<void> {
    await db.photos.update(photoId, updates);
  },

  // Delete photo
  async delete(photoId: string): Promise<void> {
    const photo = await db.photos.get(photoId);
    if (photo && photo.buildId) {
      // Remove from build's photos array
      const build = await db.builds.get(photo.buildId);
      if (build) {
        const updatedPhotos = build.photos.filter(p => p.id !== photoId);
        await db.builds.update(photo.buildId, { 
          photos: updatedPhotos,
          updatedAt: new Date() 
        });
      }
    }
    
    await db.photos.delete(photoId);
  },

  // Search photos
  async search(query: string): Promise<Photo[]> {
    const searchTerm = query.toLowerCase();
    return await db.photos
      .filter(photo => 
        photo.filename.toLowerCase().includes(searchTerm) ||
        (photo.caption?.toLowerCase().includes(searchTerm) ?? false)
      )
      .toArray();
  },

  // Filter photos
  async filter(filters: {
    buildId?: string;
    isAssigned?: boolean;
    dateRange?: { start: Date; end: Date };
    posted?: boolean;
  }): Promise<Photo[]> {
    let collection = db.photos.toCollection();
    
    if (filters.buildId) {
      collection = collection.filter(photo => photo.buildId === filters.buildId);
    }
    
    if (filters.isAssigned !== undefined) {
      if (filters.isAssigned) {
        collection = collection.filter(photo => photo.buildId !== undefined);
      } else {
        collection = collection.filter(photo => photo.buildId === undefined);
      }
    }
    
    if (filters.dateRange) {
      collection = collection.filter(photo => 
        photo.timestamp >= filters.dateRange!.start && 
        photo.timestamp <= filters.dateRange!.end
      );
    }
    
    if (filters.posted !== undefined) {
      collection = collection.filter(photo => photo.posted === filters.posted);
    }
    
    return await collection.toArray();
  }
};

// Content template operations
export const templateOperations = {
  // Create template
  async create(template: Omit<ContentTemplate, 'id'>): Promise<string> {
    const newTemplate: ContentTemplate = {
      ...template,
      id: crypto.randomUUID()
    };
    
    await db.contentTemplates.add(newTemplate);
    return newTemplate.id;
  },

  // Get all templates
  async getAll(): Promise<ContentTemplate[]> {
    return await db.contentTemplates.toArray();
  },

  // Get templates by stage
  async getByStage(stage: string): Promise<ContentTemplate[]> {
    return await db.contentTemplates.where('stage').equals(stage).toArray();
  },

  // Update template
  async update(id: string, updates: Partial<ContentTemplate>): Promise<void> {
    await db.contentTemplates.update(id, updates);
  },

  // Delete template
  async delete(id: string): Promise<void> {
    await db.contentTemplates.delete(id);
  }
};

// Calendar event operations
export const calendarOperations = {
  // Create event
  async create(event: Omit<CalendarEvent, 'id'>): Promise<string> {
    const newEvent: CalendarEvent = {
      ...event,
      id: crypto.randomUUID()
    };
    
    await db.calendarEvents.add(newEvent);
    return newEvent.id;
  },

  // Get events by date range
  async getByDateRange(start: Date, end: Date): Promise<CalendarEvent[]> {
    return await db.calendarEvents
      .where('date')
      .between(start, end, true, true)
      .toArray();
  },

  // Get events for specific date
  async getByDate(date: Date): Promise<CalendarEvent[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await db.calendarEvents
      .where('date')
      .between(startOfDay, endOfDay, true, true)
      .toArray();
  },

  // Update event
  async update(id: string, updates: Partial<CalendarEvent>): Promise<void> {
    await db.calendarEvents.update(id, updates);
  },

  // Delete event
  async delete(id: string): Promise<void> {
    await db.calendarEvents.delete(id);
  }
};

// Database utility functions
export const dbUtils = {
  // Clear all data
  async clearAll(): Promise<void> {
    await db.transaction('rw', [db.builds, db.photos, db.postContents, db.contentTemplates, db.calendarEvents], async () => {
      await db.builds.clear();
      await db.photos.clear();
      await db.postContents.clear();
      await db.contentTemplates.clear();
      await db.calendarEvents.clear();
    });
  },

  // Export data
  async exportData(): Promise<{
    builds: Build[];
    photos: Photo[];
    templates: ContentTemplate[];
    events: CalendarEvent[];
  }> {
    const [builds, photos, templates, events] = await Promise.all([
      db.builds.toArray(),
      db.photos.toArray(),
      db.contentTemplates.toArray(),
      db.calendarEvents.toArray()
    ]);

    return { builds, photos, templates, events };
  },

  // Import data
  async importData(data: {
    builds?: Build[];
    photos?: Photo[];
    templates?: ContentTemplate[];
    events?: CalendarEvent[];
  }): Promise<void> {
    await db.transaction('rw', [db.builds, db.photos, db.contentTemplates, db.calendarEvents], async () => {
      if (data.builds) await db.builds.bulkAdd(data.builds);
      if (data.photos) await db.photos.bulkAdd(data.photos);
      if (data.templates) await db.contentTemplates.bulkAdd(data.templates);
      if (data.events) await db.calendarEvents.bulkAdd(data.events);
    });
  },

  // Get database statistics
  async getStats(): Promise<{
    totalBuilds: number;
    totalPhotos: number;
    assignedPhotos: number;
    unassignedPhotos: number;
    scheduledPosts: number;
  }> {
    const [totalBuilds, totalPhotos, assignedPhotos, scheduledPosts] = await Promise.all([
      db.builds.count(),
      db.photos.count(),
      db.photos.where('buildId').above('').count(),
      db.calendarEvents.count()
    ]);

    return {
      totalBuilds,
      totalPhotos,
      assignedPhotos,
      unassignedPhotos: totalPhotos - assignedPhotos,
      scheduledPosts
    };
  }
};