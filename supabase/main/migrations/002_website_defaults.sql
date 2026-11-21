-- MAIN DATABASE (Supabase 1) : Default website settings, navigation, and pages
-- Run in the Supabase SQL editor of the MAIN project after 001_core.sql.

-- 1. Default Site Settings
insert into site_settings (key, value) values
('branding', '{
  "collegeName": "Dhaka Model College",
  "shortName": "DMC",
  "motto": "Excellence in Education, Character, and Innovation",
  "establishedYear": "1998",
  "eiin": "134250",
  "collegeCode": "1082",
  "logoUrl": "",
  "faviconUrl": ""
}'::jsonb),
('appearance', '{
  "primaryColor": "#1e40af",
  "secondaryColor": "#0f766e",
  "accentColor": "#f59e0b",
  "fontFamily": "Inter, sans-serif",
  "headerSticky": true,
  "containerWidth": "max-w-7xl"
}'::jsonb),
('homepage', '{
  "heroTitle": "Empowering Future Leaders with Knowledge & Integrity",
  "heroSubtitle": "A distinguished institution committed to academic brilliance, moral virtues, and modern technology-driven learning.",
  "heroCtaText": "Online Admission",
  "heroCtaLink": "/admission/apply",
  "heroSecondaryText": "Explore Programs",
  "heroSecondaryLink": "/academic/courses",
  "bannerImageUrl": "",
  "noticeTickerSpeed": 25,
  "noticeTickerText": "Admissions for HSC Academic Session 2026-2027 are now open! | Pre-board exam schedule published. | Annual sports meet begins next Monday."
}'::jsonb),
('homepage_sections', '{
  "noticeTicker": true,
  "heroSection": true,
  "quickLinks": true,
  "latestNews": true,
  "galleryPreview": true,
  "statistics": true,
  "principalMessage": true
}'::jsonb),
('seo', '{
  "metaTitle": "Dhaka Model College - Leading Higher Secondary College",
  "metaDescription": "Official portal of Dhaka Model College. Offering Science, Business Studies, and Humanities streams with state-of-the-art facilities and experienced faculty.",
  "keywords": "college, education, HSC, science, commerce, humanities, admission, Dhaka",
  "ogImageUrl": "",
  "googleAnalyticsId": ""
}'::jsonb),
('footer', '{
  "copyrightText": "© 2026 Dhaka Model College. All rights reserved.",
  "aboutText": "Dhaka Model College is a premier educational institution providing quality education and nurturing well-rounded graduates for over two decades.",
  "address": "Mirpur-12, Dhaka-1216, Bangladesh",
  "phone": "+880 2-9012345, +880 1712-345678",
  "email": "info@dhakamodelcollege.edu.bd",
  "emergencyHelpline": "+880 1700-000000"
}'::jsonb),
('social_links', '{
  "facebook": "https://facebook.com/dhakamodelcollege",
  "youtube": "https://youtube.com/@dhakamodelcollege",
  "twitter": "https://twitter.com/dhakamodelcoll",
  "linkedin": "https://linkedin.com/school/dhakamodelcollege",
  "instagram": "https://instagram.com/dhakamodelcollege",
  "whatsapp": "+8801712345678"
}'::jsonb),
('features', '{
  "onlineAdmission": true,
  "studentPortal": true,
  "teacherPortal": true,
  "resultPublishing": true,
  "careerPortal": false,
  "noticeBoard": true,
  "gallery": true,
  "onlinePayment": false
}'::jsonb)
on conflict (key) do update set value = excluded.value;

-- 2. Default Dynamic Pages
insert into pages (slug, title, content, status, seo_title, seo_description) values
(
  'about/overview',
  'College Overview',
  '<h2>Welcome to Dhaka Model College</h2><p>Established with the vision of providing high-quality, inclusive education, Dhaka Model College has grown into one of the country''s leading intermediate institutions. Our campus offers world-class classrooms, science labs, a rich library, and vibrant extracurricular facilities.</p><h3>Our Heritage</h3><p>Founded in 1998, we have graduated over 20,000 students who now serve across academia, healthcare, civil service, business, and technology globally.</p>',
  'published',
  'About Us - Dhaka Model College',
  'Learn about Dhaka Model College history, campus, and educational philosophy.'
),
(
  'about/principals-message',
  'Principal''s Message',
  '<h2>A Message from the Principal</h2><p>Dear Students, Parents, and Well-Wishers,</p><p>It is my distinct privilege to welcome you to Dhaka Model College. In an era of rapid global transformation, education must go beyond rote textbook knowledge. Our primary mission is to cultivate critical thinking, intellectual curiosity, and high moral character in every student entrusted to our care.</p><p>We look forward to guiding you through your most formative years of academic growth.</p><p><strong>Prof. Mohammad Rahman</strong><br/>Principal, Dhaka Model College</p>',
  'published',
  'Principal''s Message - Dhaka Model College',
  'Read the welcoming message and academic vision from the Principal.'
),
(
  'about/mission-vision',
  'Mission & Vision',
  '<h2>Our Vision</h2><p>To be a premier center of academic excellence that fosters creative thinking, ethical leadership, and responsible citizenship.</p><h2>Our Mission</h2><ul><li>Provide rigorous, holistic education in Science, Business Studies, and Humanities.</li><li>Cultivate analytical reasoning and innovative problem-solving abilities.</li><li>Instill strong ethical values, discipline, and respect for societal welfare.</li><li>Equip students with modern technological competencies for university and life.</li></ul>',
  'published',
  'Mission & Vision - Dhaka Model College',
  'Discover the core mission, vision, and core educational values of Dhaka Model College.'
),
(
  'about/history',
  'College History',
  '<h2>Our Journey Since 1998</h2><p>Dhaka Model College was established in 1998 by a consortium of visionary educationists who recognized the critical need for an institution offering disciplined, rigorous secondary and higher secondary education in Dhaka.</p><p>Starting with just 150 students and 12 faculty members in a modest building, the college has steadily expanded its infrastructure to a multi-story modern campus with state-of-the-art laboratories and digital multimedia classrooms.</p>',
  'published',
  'College History - Dhaka Model College',
  'The history and milestones of Dhaka Model College from 1998 to present day.'
),
(
  'about/management-committee',
  'Management Committee',
  '<h2>Governing Body</h2><p>The college operates under the governance of a distinguished Management Committee comprising renowned academics, legal experts, government representatives, and guardian delegates dedicated to institutional excellence.</p><ul><li><strong>Chairman:</strong> Dr. Kazi Anisur Rahman (Former Professor, University of Dhaka)</li><li><strong>Member Secretary:</strong> Principal Mohammad Rahman</li><li><strong>Teacher Representative:</strong> Associate Prof. Nasir Uddin</li><li><strong>Guardian Representatives:</strong> Engr. Tariqul Islam, Mrs. Farhana Yasmin</li></ul>',
  'published',
  'Management Committee - Dhaka Model College',
  'Governing body and leadership committee members of the college.'
),
(
  'academic/regulations',
  'Rules & Regulations',
  '<h2>Academic Code of Conduct</h2><p>Students must adhere to the highest standards of personal integrity, discipline, and respect for college staff and peers.</p><h3>Attendance Requirements</h3><p>A minimum of 75% attendance in theory and practical sessions is strictly required to qualify for Board examinations.</p><h3>Campus Discipline</h3><ul><li>ID cards must be worn visibly at all times within college premises.</li><li>Strict adherence to the college dress code is mandatory.</li><li>Use of mobile phones during classroom lectures and laboratory sessions is strictly prohibited.</li><li>Zero tolerance policy for ragging, bullying, or vandalism.</li></ul>',
  'published',
  'Rules & Regulations - Dhaka Model College',
  'College rules, student code of conduct, and attendance policies.'
),
(
  'academic/dress-code',
  'Dress Code & Uniform Policy',
  '<h2>Student Uniform Regulations</h2><p>Wearing the prescribed college uniform promotes equality, pride, and discipline among students. All students must wear the designated uniform from their first day of classes.</p><h3>Male Students</h3><p>White full/half-sleeve formal shirt with college crest embroidered on the chest pocket, navy blue trousers, black belt, and black formal shoes with white socks.</p><h3>Female Students</h3><p>White salwar-kameez with navy blue dupatta, or navy blue blazer/cardigan in winter. Black flat shoes with white socks.</p>',
  'published',
  'Uniform & Dress Code - Dhaka Model College',
  'Official student dress code, uniform guidelines, and winter wear regulations.'
),
(
  'academic/parent-guidelines',
  'Guidelines for Parents & Guardians',
  '<h2>Parent-College Partnership</h2><p>We believe that academic success is achieved through strong cooperation between guardians and the college administration.</p><ul><li>Monitor your ward''s daily attendance and exam marks through the Student Portal.</li><li>Attend all scheduled Parent-Teacher Meetings (PTMs) each term.</li><li>Ensure that your child adheres to college timings and the uniform code.</li><li>Contact the academic counselor or batch coordinator if your child requires academic support.</li></ul>',
  'published',
  'Parent Guidelines - Dhaka Model College',
  'Guidelines and recommendations for parents and guardians.'
),
(
  'academic/co-curricular',
  'Co-Curricular Activities',
  '<h2>Clubs & Student Societies</h2><p>Extracurricular engagement builds leadership, team spirit, and creative expression. Dhaka Model College hosts a vibrant variety of student clubs:</p><ul><li><strong>Science & Robotics Club:</strong> Annual science fair, coding hackathons, project exhibitions.</li><li><strong>Debate & Public Speaking Society:</strong> Bangla & English parliamentary debate tournaments.</li><li><strong>Cultural Club:</strong> Music, drama, recitation, and national day observances.</li><li><strong>Sports Club:</strong> Football, cricket, badminton, and annual athletics meet.</li><li><strong>BNCC & Scouts:</strong> Leadership training and community service.</li></ul>',
  'published',
  'Co-Curricular Activities - Dhaka Model College',
  'Clubs, sports, debate, cultural societies, and BNCC activities.'
)
on conflict (slug) do update set
  title = excluded.title,
  content = excluded.content,
  status = excluded.status,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description;
