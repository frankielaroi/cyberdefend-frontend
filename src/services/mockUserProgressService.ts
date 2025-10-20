import { localStorageService } from './localStorageService';

// Types for user progress
export interface UserProgress {
  id: string;
  userId: string;
  trainingCompleted: number;
  totalTraining: number;
  phishingTestsPassed: number;
  phishingTestsFailed: number;
  lastAssessmentScore: number;
  securityAwareness: string;
  streak: number;
  rank: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  duration: string;
  type: 'Interactive' | 'Video' | 'Reading';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  completedAt?: string;
  score?: number;
}

export interface ActivityItem {
  id: string;
  type: 'training' | 'phishing' | 'assessment';
  title: string;
  completed: boolean;
  date: string;
  score?: number;
  passed?: boolean;
}

class MockUserProgressService {
  private readonly PROGRESS_KEY = 'cyberdefend_user_progress';
  private readonly TRAINING_KEY = 'cyberdefend_user_training';
  private readonly ACTIVITY_KEY = 'cyberdefend_user_activity';

  // Simulate API delay
  private async simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 300));
  }

  // Get user progress
  async getUserProgress(userId: string): Promise<UserProgress> {
    await this.simulateDelay();

    const progress = localStorageService.getItemById<UserProgress>(this.PROGRESS_KEY, userId);

    if (!progress) {
      // Initialize with default progress
      const defaultProgress: UserProgress = {
        id: userId,
        userId,
        trainingCompleted: 8,
        totalTraining: 12,
        phishingTestsPassed: 15,
        phishingTestsFailed: 3,
        lastAssessmentScore: 78,
        securityAwareness: 'Good',
        streak: 7,
        rank: 'Security Champion'
      };

      localStorageService.addItem(this.PROGRESS_KEY, defaultProgress);
      return defaultProgress;
    }

    return progress;
  }

  // Update user progress
  async updateUserProgress(userId: string, updates: Partial<UserProgress>): Promise<UserProgress> {
    await this.simulateDelay();

    const existing = await this.getUserProgress(userId);
    const updated = { ...existing, ...updates };

    localStorageService.updateItem(this.PROGRESS_KEY, userId, updated);
    return updated;
  }

  // Get available training modules
  async getAvailableTraining(_userId: string): Promise<TrainingModule[]> {
    await this.simulateDelay();

    const training = localStorageService.getItems<TrainingModule>(this.TRAINING_KEY)
      .filter(t => !t.completed);

    if (training.length === 0) {
      // Initialize with default training modules
      const defaultTraining: TrainingModule[] = [
        {
          id: '1',
          title: 'Social Engineering Awareness',
          duration: '15 min',
          type: 'Interactive',
          priority: 'high',
          completed: false
        },
        {
          id: '2',
          title: 'Safe Email Practices',
          duration: '10 min',
          type: 'Video',
          priority: 'medium',
          completed: false
        },
        {
          id: '3',
          title: 'Password Security Best Practices',
          duration: '12 min',
          type: 'Reading',
          priority: 'low',
          completed: false
        }
      ];

      defaultTraining.forEach(t => localStorageService.addItem(this.TRAINING_KEY, t));
      return defaultTraining;
    }

    return training;
  }

  // Complete training module
  async completeTraining(userId: string, trainingId: string, score?: number): Promise<void> {
    await this.simulateDelay();

    const training = localStorageService.getItemById<TrainingModule>(this.TRAINING_KEY, trainingId);
    if (!training) return;

    const updatedTraining: TrainingModule = {
      ...training,
      completed: true,
      completedAt: new Date().toISOString(),
      score
    };

    localStorageService.updateItem(this.TRAINING_KEY, trainingId, updatedTraining);

    // Update user progress
    const progress = await this.getUserProgress(userId);
    await this.updateUserProgress(userId, {
      trainingCompleted: progress.trainingCompleted + 1
    });

    // Add to activity
    const activity: ActivityItem = {
      id: `training_${Date.now()}`,
      type: 'training',
      title: training.title,
      completed: true,
      date: new Date().toISOString().split('T')[0],
      score
    };

    localStorageService.addItem(this.ACTIVITY_KEY, activity);
  }

  // Get recent activity
  async getRecentActivity(_userId: string, limit: number = 10): Promise<ActivityItem[]> {
    await this.simulateDelay();

    const activities = localStorageService.getItems<ActivityItem>(this.ACTIVITY_KEY)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    if (activities.length === 0) {
      // Initialize with default activities
      const defaultActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'training',
          title: 'Password Security Training',
          completed: true,
          date: '2024-10-03',
          score: 95
        },
        {
          id: '2',
          type: 'phishing',
          title: 'Fake Banking Email Test',
          completed: true,
          date: '2024-10-02',
          passed: true
        },
        {
          id: '3',
          type: 'assessment',
          title: 'Monthly Security Check',
          completed: true,
          date: '2024-09-30',
          score: 78
        }
      ];

      defaultActivities.forEach(a => localStorageService.addItem(this.ACTIVITY_KEY, a));
      return defaultActivities;
    }

    return activities;
  }

  // Record phishing test result
  async recordPhishingTest(userId: string, passed: boolean, title: string): Promise<void> {
    await this.simulateDelay();

    const progress = await this.getUserProgress(userId);
    const updates: Partial<UserProgress> = {};

    if (passed) {
      updates.phishingTestsPassed = progress.phishingTestsPassed + 1;
    } else {
      updates.phishingTestsFailed = progress.phishingTestsFailed + 1;
    }

    await this.updateUserProgress(userId, updates);

    // Add to activity
    const activity: ActivityItem = {
      id: `phishing_${Date.now()}`,
      type: 'phishing',
      title,
      completed: true,
      date: new Date().toISOString().split('T')[0],
      passed
    };

    localStorageService.addItem(this.ACTIVITY_KEY, activity);
  }

  // Record assessment result
  async recordAssessment(userId: string, score: number, title: string): Promise<void> {
    await this.simulateDelay();

    await this.updateUserProgress(userId, { lastAssessmentScore: score });

    // Add to activity
    const activity: ActivityItem = {
      id: `assessment_${Date.now()}`,
      type: 'assessment',
      title,
      completed: true,
      date: new Date().toISOString().split('T')[0],
      score
    };

    localStorageService.addItem(this.ACTIVITY_KEY, activity);
  }
}

export const mockUserProgressService = new MockUserProgressService();
export default mockUserProgressService;