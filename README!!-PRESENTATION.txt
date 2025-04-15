🔊 Core Functionalities

1. Text Input + Speech Output

Why: Core requirement of the project.

Use: Converts user-typed input into audible speech.

Accessibility: Helps users with visual impairments or reading difficulties.

2. Language & Voice Selection

Why: Provides choice and personalization.

Use: Users can pick from 10+ voices (male/female) in multiple accents.

Accessibility: Supports non-native English speakers, enhances comprehension.

3. Live Voice Preview Button

Why: Immediate feedback on voice selection.

Use: Plays a test sentence using selected voice.

Accessibility: Useful for low-vision users to preview clarity.

4. Volume, Speed, Pitch Sliders

Why: Matches user hearing or speech rhythm preferences (Ch. 5).

Use: Fine-tune auditory output.

Accessibility: Helps users with hearing sensitivity or auditory processing issues.

5. Speak, Pause, Resume, Stop, Clear Controls

Why: Direct Manipulation Principle (Ch. 6).

Use: Full control over speech playback.

Accessibility: Empowers users with motor disabilities.

6. Word-by-Word Highlighting

Why: Reduces cognitive load (Ch. 2).

Use: Highlights current word as it's spoken.

Accessibility: Designed for users with dyslexia or learning disabilities.

7. Real-time Character Counter

Why: Prevents input overflow (Ch. 6 - Error Prevention).

Use: Enforces 1500-character limit.

Accessibility: Supports cognitive load management.

8. Clear Button

Why: Allows resetting input instantly.

Use: Clears all text + highlights.

Accessibility: Aids low motor skill users.

⚙️ Advanced Features

9. Auto Language Detection

Why: Helps multilingual users (Ch. 7 - Globalization).

Use: Detects input language automatically.

Accessibility: Benefits ESL learners, avoids manual selection.

10. Save & Load Favorite Settings

Why: Supports consistency (Ch. 1 - UI Design Goals).

Use: Save preferred speed, pitch, volume, and voice.

Accessibility: Aids users with memory difficulties.

11. Recent Text History (Toggle)

Why: Reduces retyping burden (Ch. 2 - Memory Load).

Use: Save last 5 inputs, load any with one click.

Accessibility: Supports users with short-term memory loss.

12. Delete Recents with Trash Icon

Why: Error Recovery (Ch. 6).

Use: Remove individual history entries.

Accessibility: Prevents clutter for neurodiverse users.

13. Responsive Layout Switcher (3 Modes)

Why: Universal Usability (Ch. 3).

Use: Switch between side-by-side, stacked, or reversed layout.

Accessibility: Adapts to screen readers, mobile, or one-hand use.

14. Auto Reset Textarea Size on Layout Change

Why: Prevents collision or overflow issues.

Use: Clears custom resizing when layout changes.

Accessibility: Fixes readability issues for all users.

🎨 Accessibility + UX Enhancements

15. Theme Selector (Light, Dark, High Contrast, Colorblind)

Why: Color contrast & readability (Ch. 5, 7).

Use: Choose preferred visual theme.

Accessibility: Aids users with visual impairments, color blindness, and migraine triggers.

16. Font Size & Line Spacing Controls

Why: Visual clarity (Ch. 4).

Use: Adjust font size and spacing dynamically.

Accessibility: Helps low vision and dyslexic users.

17. Large Button Mode

Why: Device input flexibility (Ch. 3).

Use: Increases button size.

Accessibility: Aids elderly or tremor-affected users.

18. Keyboard Shortcuts

Why: Improves efficiency.

Use: Space = Pause/Resume, Esc = Stop, R = Resume, Ctrl + Arrows = Font.

Accessibility: Allows hands-free or quick navigation.

📦 Tools & Technologies Used

HTML/CSS/JS – For front-end & accessibility logic.

Web Speech API – For TTS synthesis.

Flask + Python – Backend language detection & translation.

localStorage – For saving user settings & recent entries.

Font Awesome – Icons for accessibility clarity.

✅ Usability Testing Summary

Tested on: Desktop, Tablet, Mobile.

Recents & Layouts tested in real usage scenarios.

Adjustments made based on user feedback:

Removed grammar checker (caused clutter).

Improved mobile responsiveness & removed excess buttons.

🔮 Future Improvements

Add Speech-to-Text support.

Integrate offline mode for TTS.

Add user authentication to save preferences across devices.

This project was developed by keeping real user needs and course design principles in mind. It balances clean UI, accessibility, and flexibility to serve a wide range of users effectively.

