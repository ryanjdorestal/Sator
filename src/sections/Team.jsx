import React from 'react';

export default function Team() {
  const teamMembers = [
    {
      name: 'Naomi Rai',
      role: 'Mechanical Systems Lead',
      description: 'Focused on mechanical design and fabrication, CAD, prototyping, robotics, sustainable engineering, and problem-solving.',
      image: '/team_profile_naomi.png'
    },
    {
      name: 'Ryan J. Dorestal',
      role: 'Systems & AI Lead',
      description: 'Computer science researcher and designer focused on intelligent systems, web development, AI integration, and human-computer interaction.',
      image: '/team_profile_ryan.png'
    },
    {
      name: 'Chloe Pham',
      role: 'Electrical & Robotics Lead',
      description: 'Electrical engineer with experience in sensor systems, embedded hardware, automation, and building efficient, data-driven machines.',
      image: '/team_profile_chloe.png'
    },
    {
      name: 'Khurram Valiyev',
      role: 'Embedded Systems & Control Lead',
      description: 'Specializing in embedded devices, control logic, programming, hardware integration, and IoT development.',
      image: '/team_profile_khurram.png'
    }
  ];

  return (
    <section
      id="team"
      className="relative isolate bg-[#E3E7DE] py-[100px]"
    >
      {/* Topographic pattern overlay */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('/topographic_pattern_team.png')] bg-cover bg-center opacity-10" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* White container */}
        <div className="relative mx-auto w-[85%] max-w-[1200px] rounded-[20px] bg-white shadow-[0_10px_15px_rgba(0,0,0,0.08)]" style={{ padding: '40px 60px' }}>
          {/* Title + underline */}
          <h2 className="relative inline-block font-bold text-[36px] leading-none uppercase text-[#204D36] mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            TEAM
            <span
              aria-hidden
              className="absolute left-0 block h-[4px] w-[80px] rounded-full bg-[#E0A622]"
              style={{ top: 'calc(100% + 8px)' }}
            />
          </h2>

          {/* Team grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mt-12">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                {/* Circular profile image */}
                <div className="mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover"
                  />
                </div>

                {/* Name */}
                <h3 className="font-bold text-[24px] text-[#204D36] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {member.name}
                </h3>

                {/* Role */}
                <p className="font-semibold text-[16px] text-[#204D36] mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {member.role}
                </p>

                {/* Description */}
                <p className="font-normal text-[12px] md:text-[14px] text-[#204D36] leading-[1.5]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
