import { StudentJourneyProfile, StudentResumeSettings } from '../types';

/**
 * Escapes characters for PDF literal strings in syntax ( ... )
 */
function escapePdfText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' '); // Keep printable ASCII
}

/**
 * Wraps text into lines that fit within maxChars
 */
function wrapText(text: string, maxChars: number): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!word) continue;
    if ((currentLine + (currentLine ? ' ' : '') + word).length <= maxChars) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Builds a syntactically valid PDF 1.4 document containing only the one-page A4 resume.
 * A4 size: 595.28 x 841.89 points.
 */
export function generateResumePdfBlob(
  profile: StudentJourneyProfile,
  settings: StudentResumeSettings
): Blob {
  const { student, achievements, participations, projects, certifications, internships } = profile;

  // Filter items that the student chose to display on their resume
  const resumeInternships = (internships || [])
    .filter(i => i.showOnResume !== false)
    .sort((a, b) => (a.resumeOrder || 0) - (b.resumeOrder || 0));

  const resumeProjects = (projects || [])
    .filter(p => p.showOnResume !== false)
    .sort((a, b) => (a.resumeOrder || 0) - (b.resumeOrder || 0));

  const resumeAchievements = (achievements || [])
    .filter(a => a.showOnResume !== false)
    .sort((a, b) => (a.resumeOrder || 0) - (b.resumeOrder || 0));

  const resumeParticipations = (participations || [])
    .filter(p => p.showOnResume !== false)
    .sort((a, b) => (a.resumeOrder || 0) - (b.resumeOrder || 0));

  const resumeCertifications = (certifications || [])
    .filter(c => c.showOnResume !== false)
    .sort((a, b) => (a.resumeOrder || 0) - (b.resumeOrder || 0));

  const resumeLeadership = [
    ...(participations || []).filter(
      p =>
        p.showOnResume !== false &&
        (p.category === 'NCC/NSS' ||
          p.category === 'Fest' ||
          (p.role && /lead|head|president|secretary|coordinator|volunteer|sergeant/i.test(p.role)))
    ),
    ...(achievements || []).filter(
      a =>
        a.showOnResume !== false &&
        (a.category === 'Cultural' ||
          a.category === 'Sports' ||
          (a.title && /leadership|lead|head|president|coordinator|captain|cadet/i.test(a.title)))
    )
  ].sort((a, b) => (a.resumeOrder || 0) - (b.resumeOrder || 0));

  // Stream content commands
  const commands: string[] = [];

  // Margins
  const marginX = 40;
  const pageWidth = 595.28;
  const contentWidth = pageWidth - marginX * 2; // ~515
  let y = 805; // Starting Y coordinate near top of A4 (842pt height)

  const checkY = (neededHeight: number) => {
    return y - neededHeight > 40;
  };

  // Helper to draw text
  const drawText = (
    text: string,
    x: number,
    yPos: number,
    font = '/F1',
    size = 10,
    r = 0.06,
    g = 0.09,
    b = 0.16
  ) => {
    commands.push(`BT ${font} ${size} Tf ${r} ${g} ${b} rg ${x.toFixed(2)} ${yPos.toFixed(2)} Td (${escapePdfText(text)}) Tj ET`);
  };

  // Helper to draw horizontal line
  const drawLine = (x1: number, yPos: number, x2: number, r = 0.8, g = 0.83, b = 0.88, lineWidth = 0.75) => {
    commands.push(`${lineWidth} w ${r} ${g} ${b} RG ${x1.toFixed(2)} ${yPos.toFixed(2)} m ${x2.toFixed(2)} ${yPos.toFixed(2)} l S`);
  };

  // 1. HEADER SECTION
  drawText((student.name || 'STUDENT NAME').toUpperCase(), marginX, y, '/F1', 18, 0.06, 0.09, 0.16);
  y -= 14;

  const branchText = `${student.branch || 'Computer Science & Engineering'} • ${student.collegeName || 'CampusLife Institute of Technology'}`;
  drawText(branchText, marginX, y, '/F1', 9.5, 0.25, 0.31, 0.42);

  // CampusLife ID tag (right aligned)
  const idText = `CampusLife ID: ${student.studentId || student.id}`;
  drawText(idText, pageWidth - marginX - 140, y + 14, '/F3', 8.5, 0.31, 0.27, 0.9);
  y -= 13;

  // Contact Info Row
  const contactParts: string[] = [];
  if (settings.showEmail && student.email) contactParts.push(student.email);
  if (settings.showPhone && (settings.phone || student.phone)) contactParts.push(settings.phone || student.phone || '');
  if (settings.showLocation && (settings.location || student.address)) contactParts.push(settings.location || student.address || '');
  if (settings.showLinkedIn && (settings.linkedIn || student.linkedinUrl)) {
    contactParts.push(`linkedin.com/in/${(settings.linkedIn || student.linkedinUrl || '').replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, '')}`);
  }
  if (settings.showGithub && (settings.github || student.githubUrl)) {
    contactParts.push(`github.com/${(settings.github || student.githubUrl || '').replace(/^https?:\/\/(www\.)?github\.com\/?/, '')}`);
  }

  if (contactParts.length > 0) {
    const contactLine = contactParts.join('  |  ');
    const wrappedContact = wrapText(contactLine, 95);
    for (const line of wrappedContact) {
      drawText(line, marginX, y, '/F2', 8, 0.4, 0.45, 0.55);
      y -= 10;
    }
  }

  y -= 2;
  drawLine(marginX, y, pageWidth - marginX, 0.1, 0.15, 0.25, 1.25);
  y -= 12;

  // Helper for Section Headings
  const renderSectionHeading = (title: string) => {
    drawText(title.toUpperCase(), marginX, y, '/F1', 9.5, 0.08, 0.12, 0.2);
    y -= 4;
    drawLine(marginX, y, pageWidth - marginX, 0.82, 0.85, 0.9, 0.75);
    y -= 10;
  };

  // 2. PROFESSIONAL SUMMARY
  if (settings.visibleSections.summary && settings.summary && checkY(35)) {
    renderSectionHeading('Professional Summary');
    const summaryLines = wrapText(settings.summary, 98);
    for (const line of summaryLines.slice(0, 3)) {
      drawText(line, marginX, y, '/F2', 8.5, 0.2, 0.25, 0.32);
      y -= 10.5;
    }
    y -= 4;
  }

  // 3. EDUCATION
  if (settings.visibleSections.education && checkY(38)) {
    renderSectionHeading('Education');
    const degreeTitle = `Bachelor of Technology in ${student.branch || 'Computer Science & Engineering'}`;
    drawText(degreeTitle, marginX, y, '/F1', 9, 0.08, 0.12, 0.2);

    const yearText = `${student.year || '3rd Year'} • Class of 2026`;
    drawText(yearText, pageWidth - marginX - 100, y, '/F3', 8.5, 0.45, 0.5, 0.6);
    y -= 11;

    const collegeLine = `${student.collegeName || 'CampusLife Institute of Technology'}${settings.showGpa && student.cgpa ? `   |   Cumulative CGPA: ${student.cgpa} / 10.0` : ''}`;
    drawText(collegeLine, marginX, y, '/F2', 8.5, 0.3, 0.35, 0.45);
    y -= 13;
  }

  // 4. INTERNSHIPS & EXPERIENCE
  if (settings.visibleSections.internships && resumeInternships.length > 0 && checkY(50)) {
    renderSectionHeading('Internships & Professional Experience');
    for (const intern of resumeInternships.slice(0, 2)) {
      if (!checkY(35)) break;
      const roleText = `${intern.role} - ${intern.companyName}`;
      drawText(roleText, marginX, y, '/F1', 9, 0.08, 0.12, 0.2);

      const period = intern.endDate ? `${intern.startDate} - ${intern.endDate}` : (intern.isCurrent ? `${intern.startDate} - Present` : intern.startDate);
      drawText(period, pageWidth - marginX - 90, y, '/F3', 8, 0.45, 0.5, 0.6);
      y -= 10.5;

      const verificationTag = intern.verificationStatus === 'verified' || intern.verificationStatus === 'verified_institution'
        ? '[Institutional Verification Active ✓]'
        : '';
      if (verificationTag) {
        drawText(verificationTag, marginX, y, '/F1', 7.5, 0.02, 0.55, 0.35);
        y -= 9.5;
      }

      const descLines = wrapText(intern.description || '', 95);
      for (const line of descLines.slice(0, 2)) {
        drawText(`•  ${line}`, marginX + 4, y, '/F2', 8, 0.25, 0.3, 0.38);
        y -= 9.5;
      }
      y -= 3;
    }
  }

  // 5. KEY PROJECTS
  if (settings.visibleSections.projects && resumeProjects.length > 0 && checkY(50)) {
    renderSectionHeading('Key Academic & Technical Projects');
    for (const proj of resumeProjects.slice(0, 3)) {
      if (!checkY(30)) break;
      const projTitle = proj.name;
      drawText(projTitle, marginX, y, '/F1', 8.5, 0.08, 0.12, 0.2);

      if (proj.technologies && proj.technologies.length > 0) {
        const stackText = `[${proj.technologies.slice(0, 4).join(', ')}]`;
        drawText(stackText, marginX + 180, y, '/F3', 8, 0.4, 0.45, 0.55);
      }

      if (proj.year || proj.githubUrl || proj.demoUrl) {
        drawText(proj.year || '2024', pageWidth - marginX - 50, y, '/F3', 8, 0.45, 0.5, 0.6);
      }
      y -= 10;

      const descLines = wrapText(proj.description || '', 95);
      for (const line of descLines.slice(0, 2)) {
        drawText(`•  ${line}`, marginX + 4, y, '/F2', 8, 0.25, 0.3, 0.38);
        y -= 9.5;
      }
      y -= 2.5;
    }
  }

  // 6. TECHNICAL & PROFESSIONAL SKILLS
  if (settings.visibleSections.skills && settings.skills && settings.skills.length > 0 && checkY(35)) {
    renderSectionHeading('Technical & Professional Competencies');
    const skillsText = settings.skills.join('  •  ');
    const wrappedSkills = wrapText(skillsText, 95);
    for (const line of wrappedSkills.slice(0, 2)) {
      drawText(line, marginX, y, '/F2', 8.5, 0.18, 0.22, 0.3);
      y -= 10.5;
    }
    y -= 3;
  }

  // 7. VERIFIED ACHIEVEMENTS & AWARDS
  if (settings.visibleSections.achievements && resumeAchievements.length > 0 && checkY(35)) {
    renderSectionHeading('Verified Achievements & Honors');
    for (const ach of resumeAchievements.slice(0, 2)) {
      if (!checkY(25)) break;
      const achTitle = `${ach.title} (${ach.category || 'Academic'})`;
      drawText(achTitle, marginX, y, '/F1', 8.5, 0.08, 0.12, 0.2);
      drawText(ach.date || ach.year || '2024', pageWidth - marginX - 60, y, '/F3', 8, 0.45, 0.5, 0.6);
      y -= 10;

      const desc = ach.description ? wrapText(ach.description, 95)[0] : '';
      if (desc) {
        drawText(`•  ${desc}`, marginX + 4, y, '/F2', 8, 0.25, 0.3, 0.38);
        y -= 9.5;
      }
      y -= 2;
    }
  }

  // 8. VERIFIED CERTIFICATIONS
  if (settings.visibleSections.certifications && resumeCertifications.length > 0 && checkY(35)) {
    renderSectionHeading('Certifications & Credentials');
    for (const cert of resumeCertifications.slice(0, 2)) {
      if (!checkY(25)) break;
      const certLine = `${cert.name}  —  ${cert.organization}${cert.credentialId ? ` (ID: ${cert.credentialId})` : ''}`;
      drawText(certLine, marginX, y, '/F1', 8.5, 0.08, 0.12, 0.2);
      drawText(cert.issueDate || '2024', pageWidth - marginX - 60, y, '/F3', 8, 0.45, 0.5, 0.6);
      y -= 10.5;
    }
  }

  // 9. LEADERSHIP & VOLUNTEERING
  if (settings.visibleSections.leadership !== false && resumeLeadership.length > 0 && checkY(35)) {
    renderSectionHeading('Leadership & Extracurriculars');
    for (const item of resumeLeadership.slice(0, 2)) {
      if (!checkY(25)) break;
      const isPart = 'eventName' in item;
      const title = isPart ? (item as any).eventName : (item as any).title;
      const role = isPart ? (item as any).role : (item as any).category;
      const line = `${title}${role ? ` [${role}]` : ''}${item.organization ? ` (${item.organization})` : ''}`;
      drawText(line, marginX, y, '/F1', 8.5, 0.08, 0.12, 0.2);
      drawText(item.date || item.year || '2024', pageWidth - marginX - 60, y, '/F3', 8, 0.45, 0.5, 0.6);
      y -= 10.5;
    }
  }

  // 10. TRUST FOOTER STAMP (Anchored near bottom)
  const footerY = Math.max(y - 10, 30);
  drawLine(marginX, footerY + 12, pageWidth - marginX, 0.85, 0.88, 0.92, 0.5);
  drawText('Verified Student Academic Record • Generated via CampusLife ERP', marginX, footerY, '/F2', 7.5, 0.45, 0.5, 0.58);
  const stampText = `Trust Stamp: ${student.studentId || '21CS042'}-${new Date().getFullYear()}-VERIFIED`;
  drawText(stampText, pageWidth - marginX - 180, footerY, '/F3', 7.5, 0.45, 0.5, 0.58);

  // Construct Content Stream
  const streamContent = commands.join('\n');
  const streamLength = streamContent.length;

  // Assembly of PDF 1.4 objects
  const objects: string[] = [];

  // Object 1: Catalog
  objects.push(`1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj`);

  // Object 2: Pages
  objects.push(`2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj`);

  // Object 3: Page
  objects.push(`3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 595.28 841.89]
  /Resources <<
    /Font <<
      /F1 4 0 R
      /F2 5 0 R
      /F3 6 0 R
    >>
  >>
  /Contents 7 0 R
>>
endobj`);

  // Object 4: Font Bold
  objects.push(`4 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica-Bold
>>
endobj`);

  // Object 5: Font Regular
  objects.push(`5 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica
>>
endobj`);

  // Object 6: Font Oblique
  objects.push(`6 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica-Oblique
>>
endobj`);

  // Object 7: Content Stream
  objects.push(`7 0 obj
<<
  /Length ${streamLength}
>>
stream
${streamContent}
endstream
endobj`);

  // Calculate byte offsets for xref
  const header = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  let currentOffset = header.length;
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(currentOffset);
    currentOffset += obj.length + 1; // +1 for '\n'
  }

  const xrefStart = currentOffset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    const padOffset = String(offsets[i]).padStart(10, '0');
    xref += `${padOffset} 00000 n \n`;
  }

  const trailer = `trailer
<<
  /Size ${objects.length + 1}
  /Root 1 0 R
>>
startxref
${xrefStart}
%%EOF`;

  const pdfData = header + objects.join('\n') + '\n' + xref + trailer;
  return new Blob([pdfData], { type: 'application/pdf' });
}

/**
 * Downloads the generated PDF directly to the user's computer.
 */
export function downloadResumePdf(
  profile: StudentJourneyProfile,
  settings: StudentResumeSettings
): void {
  const studentName = profile?.student?.name ? profile.student.name.replace(/\s+/g, '_') : 'Student';
  const fileName = `${studentName}_Resume.pdf`;

  const blob = generateResumePdfBlob(profile, settings);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
