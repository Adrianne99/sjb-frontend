// =============================================================================
// SCHOOL INFORMATION & PUBLIC WEBSITE CONTENT
// -----------------------------------------------------------------------------
// ✏️  Edit this file to update the landing page — no other code changes needed.
//
// IMPORTANT: Anything marked `placeholder: true` (or wrapped in [brackets]) is
// NOT official. Replace it with information approved by the school before
// launch. We intentionally did not invent the school's mission, vision,
// programs, requirements or contact details.
// =============================================================================

export const school = {
  name: "Saint John Bosco Institute of Arts and Sciences",
  shortName: "Saint John Bosco",
  acronym: "SJBIAS",
  location: "Kalentong, Mandaluyong City",
  systemName: "School Management System",

  logo: {
    /** The official crest ("You are a student and a friend", 1996). Keep its aspect ratio. */
    src: "/assets/logo/sjb-logo.png",
    alt: "Saint John Bosco Institute of Arts and Sciences crest",
  },

  hero: {
    /** Replace this file to change the hero photo. A navy fallback shows if it is missing. */
    backgroundImage: "/assets/images/landing/campus-front.png",
    /** Which part of the photo stays visible when it is cropped (CSS background-position). "center 30%" keeps the school sign in view. */
    backgroundPosition: "center 30%",
    // --- Hero overlay (the blue layer over the WHOLE photo) -------------------
    // overlayColor:   a hex color. Ideas:
    //                   "#152851" navy (default)   "#0c1833" darkest navy
    //                   "#1a3266" deep blue        "#254a9a" royal blue
    // overlayOpacity: how strong the color is, 0 to 100.
    //                   0 = no overlay (photo fully visible), 100 = solid color.
    //                   60–70 shows more of the photo; 85–90 makes text stand out more.
    overlayColor: "#152851",
    overlayOpacity: 80,
    eyebrow: "Kalentong, Mandaluyong City",
    headline: "Shaping Students for Excellence, Character, and Service.",
    subheadline:
      "At SJBIAS, we focus on hands-on learning, good character, and affordable education. Whether you want to learn tech, business, or the arts, we are here to guide you every step of the way.",
    primaryCta: { label: "Enroll Now", to: "/apply" },
    secondaryCta: { label: "View Programs", to: "/#academics" },
  },

  about: {
    placeholder: true,
    intro:
      "Saint John Bosco Institute of Arts and Sciences is a welcoming learning community located in Kalentong, Mandaluyong. For years, our school has provided accessible, quality education to local youths and working students who want to build a better future. We take pride in serving hardworking learners by teaching practical knowledge, technical skills, and good moral values so they can succeed in their chosen careers and help their families.",
    mission:
      "To give students quality and affordable education that teaches practical skills, builds strong character, and prepares them for real jobs and honest service to the community.",
    vision:
      "To be a trusted school that produces skilled, hardworking, and kind graduates who make a positive difference in their workplace and society.",
    values: [
      {
        title: "Integrity",
        description:
          "Doing what is right, honest, and fair in our studies, work, and everyday life.",
      },
      {
        title: "Excellence",
        description:
          "Working hard and always doing our best to learn practical skills that matter in the real world.",
      },
      {
        title: "Service",
        description:
          "Using our education and talents to help others and give back to our community.",
      },
    ],
  },

  /**
   * Program cards on the landing page. Senior High School (Grade 11–12) and the
   * two college programs (1st and 2nd year) are confirmed by the school;
   * descriptions in [brackets] are placeholders to replace.
   */
  programs: [
    {
      code: "SHS",
      name: "Senior High School",
      level: "Grade 11 – 12",
      // SAMPLE text in simple English — replace with the school's official description (and its strands).
      description:
        "Grade 11 and Grade 12. Get ready for college or work with core subjects, practical skills and good values. Choose a strand that matches your future plans.",
    },
    {
      code: "IT",
      name: "Information Technology",
      level: "College · 1st – 2nd Year",
      // SAMPLE text — replace with the official program description.
      description:
        "Learn how computers, programs and networks work. Practice coding, databases and computer security in hands-on classes, so you are ready for an IT job.",
    },
    {
      code: "HRS",
      name: "Hotel and Restaurant Services",
      level: "College · 1st – 2nd Year",
      // SAMPLE text — replace with the official program description.
      description:
        "Learn the skills used in hotels and restaurants: food and drink service, front office, housekeeping, and safety and cleanliness. Train in real kitchen and room setups.",
    },
  ],

  /** Admission steps (the system's enrollment flow: apply online → Registrar → Accounting → account). */
  admissionSteps: [
    {
      title: "Apply online",
      description:
        "Fill in the pre-registration form (Enroll Now). You get a reference number by email.",
    },
    {
      title: "Requirements",
      description:
        "Bring the original documents listed below to the Registrar's Office, with your reference number.",
    },
    {
      title: "Enrollment",
      description:
        "The Registrar checks your documents and creates your student record.",
    },
    {
      title: "Payment",
      description:
        "Pay the down payment or full payment at the Accounting Office. No online payment.",
    },
    {
      title: "Confirmation",
      description:
        "Once enrolled, you get your class schedule and Student Portal login by email.",
    },
  ],

  contact: {
    placeholder: true,
    address: "Kalentong, Mandaluyong City, Metro Manila, Philippines",
    addressNote: "#55 Shaw Blvd, General Kalentong, Mandaluyong City, 1550 Metro Manila, Phillippines",
    phone: "(02) 0000-0000",
    email: "Sjb@school.edu.ph",
    officeHours: "Monday to Friday, 8:00 AM – 5:00 PM",
  },

  social: {
    /** The school's Facebook page/photo provided as a reference. */
    facebook:
      "https://www.facebook.com/photo/?fbid=509468844511697&set=a.509468811178367",
  },
} as const;

export type SchoolConfig = typeof school;
