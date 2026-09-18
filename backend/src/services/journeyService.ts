import {
  Achievement,
  Participation,
  Project,
  Certification,
  TimelineMilestone,
  StudentJourneyProfile,
  User
} from '../models/types.js';

export class JourneyService {
  /**
   * Aggregates and sorts all student records into a chronological milestone timeline
   */
  static buildTimeline(
    achievements: Achievement[],
    participations: Participation[],
    projects: Project[],
    certifications: Certification[]
  ): TimelineMilestone[] {
    const milestones: TimelineMilestone[] = [
      {
        year: '2023',
        title: 'Joined CampusLife Institute of Technology',
        type: 'academic',
        category: 'Admissions',
        date: '2023-08-01',
        description: 'Began Bachelor of Technology in Computer Science & Engineering (Batch 2023-2027).'
      }
    ];

    // Map achievements
    achievements.forEach((ach) => {
      milestones.push({
        year: ach.year || (ach.date ? ach.date.split('-')[0] : '2025'),
        title: ach.title,
        type: 'achievement',
        category: ach.category,
        date: ach.date,
        description: ach.description,
        status: ach.verificationStatus,
        badge: 'Award / Achievement'
      });
    });

    // Map participations
    participations.forEach((part) => {
      milestones.push({
        year: part.year || (part.date ? part.date.split('-')[0] : '2025'),
        title: `${part.eventName} (${part.role})`,
        type: 'participation',
        category: part.category,
        date: part.date,
        description: `${part.description} ${part.result ? `• Result: ${part.result}` : ''}`,
        status: part.verificationStatus,
        badge: part.result || 'Participant'
      });
    });

    // Map projects
    projects.forEach((proj) => {
      milestones.push({
        year: proj.year || '2025',
        title: `Project: ${proj.name}`,
        type: 'project',
        category: 'Development',
        date: `${proj.year}-06-01`,
        description: `${proj.description} (Built with ${proj.technologies.join(', ')})`,
        badge: 'Project Showcase'
      });
    });

    // Map certifications
    certifications.forEach((cert) => {
      milestones.push({
        year: cert.issueDate ? cert.issueDate.split('-')[0] : '2025',
        title: `Certification: ${cert.name}`,
        type: 'certification',
        category: cert.organization,
        date: cert.issueDate,
        description: `Issued by ${cert.organization}. Credential ID: ${cert.credentialId || 'Verified'}`,
        status: cert.verificationStatus,
        badge: 'Certified'
      });
    });

    // Sort descending or chronological. Ascending order for journey progression:
    return milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}
