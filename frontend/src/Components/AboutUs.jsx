import React, { useState } from 'react';
import sajjadImg from '../Images/male-profile.jpg';
import jamalImg from '../Images/male-profile.jpg';
import hamidImg from '../Images/male-profile.jpg';
import maleProfile from '../Images/Dr.Mumthaz.jpg';
import './AboutUs.css';

export default function AboutUs() {
  const [supervisorImgError, setSupervisorImgError] = useState(false);
  const [memberImgErrors, setMemberImgErrors] = useState({});

  const handleMemberError = (id) => {
    setMemberImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  const teamMembers = [
    {
      id: 'sajjad',
      name: 'Muhammad Sajjad',
      role: 'Backend Developer',
      src: sajjadImg,
      initials: 'MS',
      objectPosition: 'center 15%'
    },
    {
      id: 'jamal',
      name: 'Muhammad Jamal',
      role: 'ML Engineer',
      src: jamalImg,
      initials: 'MJ',
      objectPosition: 'top center'
    },
    {
      id: 'hamidurrahman',
      name: 'Hamidurrahman',
      role: 'Frontend Developer',
      src: hamidImg,
      initials: 'H',
      objectPosition: 'top center'
    }
  ];

  return (
    <div className="about-page-container">
      {/* PAGE HEADER */}
      <header className="about-header">
        <h1 className="about-title">Our Team</h1>
        <p className="about-subtitle">
          We are building practical AI tools to help farmers make smarter, faster decisions in the field and in the market.
        </p>
      </header>

      {/* SUPERVISOR CARD */}
      <article className="about-supervisor-prominent">
        <div className="about-supervisor-left">
          {!supervisorImgError ? (
            <img
              src="/assets/dr-mumthaz.jpg"
              alt="Dr. Mumthaz Khan"
              className="about-supervisor-img"
              onError={(e) => {
                if (e.target.src !== maleProfile) {
                  e.target.src = maleProfile;
                } else {
                  setSupervisorImgError(true);
                }
              }}
            />
          ) : (
            <div className="about-supervisor-placeholder">MK</div>
          )}
        </div>

        <div className="about-supervisor-right">
          <span className="about-supervisor-pill">
            Supervisor & Principal Investigator
          </span>
          <h2 className="about-supervisor-name">Dr. Mumthaz Khan</h2>
          <h3 className="about-supervisor-role">
            Assistant Professor · Computer Science
          </h3>
          <p className="about-supervisor-inst">
            Government Postgraduate College Khar, Bajaur
          </p>

          <div className="about-divider" />

          <p className="about-supervisor-bio">
             
                        ڈاکٹر ممتاز خان — مختصر تعارف 
ڈاکٹر ممتاز خان نے کمپیوٹر سائنس میں پی ایچ ڈی کی ڈگری حاصل کی اور اس وقت گورنمنٹ پوسٹ گریجویٹ کالج خار، باجوڑ (محکمۂ اعلیٰ تعلیم، خیبر پختونخوا) میں اسسٹنٹ پروفیسر کے طور پر تدریسی و تحقیقی خدمات انجام دے رہے ہیں۔
آپ کی تحقیق کا مرکز جدید کمپیوٹر سائنس کے موضوعات جیسے مصنوعی ذہانت (AI)، مشینی تعلیم (Machine Learning)، سمارٹ سسٹمز، ڈیجیٹل لرننگ پلیٹ فارمز، اور اڈاپٹیو یوزر انٹرفیسز ہے۔ آپ نے متعدد قومی و بین الاقوامی تحقیقی مقالے شائع کیے ہیں اور اعلیٰ تعلیم میں ریسرچ کلچر کو فروغ دینے کے لیے سرگرم ہیں۔
ڈاکٹر ممتاز نہ صرف ایک محقق اور استاد ہیں بلکہ ایک سماجی مبصر بھی ہیں، جو ٹیکنالوجی، تعلیم، اور سوشل میڈیا کے اثرات پر مدلل رائے رکھتے ہیں۔ آپ کا مشن ہے کہ ڈیجیٹل ٹیکنالوجی کو معاشرتی بہتری، نوجوانوں کی رہنمائی، اور دور افتادہ علاقوں کی ترقی کے لیے استعمال میں لایا جائے۔</p>


          <div className="about-supervisor-tags">
            <span className="about-tag-pill">Machine Learning</span>
            <span className="about-tag-pill">AI Research</span>
          </div>
        </div>
      </article>

      {/* TEAM MEMBERS GRID */}
      <div className="about-team-grid">
        {teamMembers.map((member) => (
          <article key={member.id} className="about-member-card">
            <div className="about-member-top">
              {!memberImgErrors[member.id] ? (
                <img
                  src={member.src}
                  alt={member.name}
                  className="about-member-img"
                  style={{ objectPosition: member.objectPosition || 'center 15%' }}
                  onError={() => handleMemberError(member.id)}
                />
              ) : (
                <div className="about-member-fallback">{member.initials}</div>
              )}
            </div>

            <div className="about-member-body">
              <h3 className="about-member-name">{member.name}</h3>
              <span className="about-member-badge">{member.role}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
