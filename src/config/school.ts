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
    backgroundImage: "/assets/images/landing/01_hero_students.jpg",
    /** Which part of the photo stays visible when it is cropped (CSS background-position). "center" keeps the building and students in view. */
    backgroundPosition: "center",
    // --- Hero overlay (the blue layer over the WHOLE photo) -------------------
    // overlayColor:   a hex color. Ideas:
    //                   "#152851" navy (default)   "#0c1833" darkest navy
    //                   "#1a3266" deep blue        "#254a9a" royal blue
    // overlayOpacity: how strong the color is, 0 to 100.
    //                   0 = no overlay (photo fully visible), 100 = solid color.
    //                   60–70 shows more of the photo; 85–90 makes text stand out more.
    overlayColor: "#152851",
    overlayOpacity: 80,
    headline: "Shaping Students for Excellence, Character, and Service.",
    subheadline:
      "At SJBIAS, we focus on hands-on learning, good character, and affordable education. Whether you want to learn tech, business, or the arts, we are here to guide you every step of the way.",
    primaryCta: { label: "Enroll Now", to: "/apply" },
    secondaryCta: { label: "View Programs", to: "/#academics" },
  },

  about: {
    placeholder: true,
    /** Photo beside the "About" text. Replace the file to change it. */
    image: "/assets/images/landing/07_campus.jpg",
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
      /** Card photo. Put the file in public/assets/images/landing/ — a navy panel shows until it exists. */
      image: "/assets/images/landing/04_senior_high_students.jpg",
      // SAMPLE text in simple English — replace with the school's official description (and its strands).
      description:
        "Grade 11 and Grade 12. Get ready for college or work with core subjects, practical skills and good values. Choose a strand that matches your future plans.",
    },
    {
      code: "IT",
      name: "Information Technology",
      level: "College · 1st – 2nd Year",
      image: "/assets/images/landing/05_information_technology.jpg",
      // SAMPLE text — replace with the official program description.
      description:
        "Learn how computers, programs and networks work. Practice coding, databases and computer security in hands-on classes, so you are ready for an IT job.",
    },
    {
      code: "HRS",
      name: "Hotel and Restaurant Services",
      level: "College · 1st – 2nd Year",
      image: "/assets/images/landing/06_hotel_restaurant_services.jpg",
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
    addressNote: "#55 Shaw Blvd, General Kalentong, Mandaluyong City, 1550 Metro Manila, Philippines",
    phone: "(02) 0000-0000",
    email: "Sjb@school.edu.ph",
    officeHours: "Monday to Friday, 8:00 AM – 5:00 PM",
  },

  /** Other photos used around the app (files in public/assets/images/landing/). */
  images: {
    /** Login and password pages (left panel, large screens). */
    signIn: "/assets/images/landing/02_don_bosco_statue.jpg",
    /** Don Bosco statue fading in at the top-right of "Academic programs" (large screens). */
    programsStatue: "/assets/images/landing/03_don_bosco_closeup.jpg",
    /** Title band at the top of inner pages (Announcements, Apply, Privacy, Terms). */
    pageBanner: "/assets/images/landing/03_don_bosco_closeup.jpg",
    /** Announcements without their own photo get one of these (always the same one per announcement). */
    announcementFallbacks: [
      "/assets/images/landing/08_student_writing.jpg",
      "/assets/images/landing/09_school_celebration.jpg",
      "/assets/images/landing/10_library_student.jpg",
    ],
  },

  social: {
    /** The school's Facebook page/photo provided as a reference. */
    facebook:
      "https://www.facebook.com/photo/?fbid=509468844511697&set=a.509468811178367",
  },
} as const;

export type SchoolConfig = typeof school;
