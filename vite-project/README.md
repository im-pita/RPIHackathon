Does all of this gen Alpha slang make you feel unc? Translate modern language into old skool slang. Sick right!

Inspiration
There are so many modern slang terms that can be hard for older generations to acclimate to. I've seen my parents struggle to understand my Gen Alpha sister. New words get thrown around all the time, and can make the generation gap feel larger than it should.

This isn't limited only to older users struggling to understand modern slang, as it can also help those with social anxiety fit into the modern world better. This can help with mental health issues such as anxiety by promoting inclusivity and reducing feelings of being left out.

What it does
A user can speak or type in a phrase with Gen Alpha slang. The web application will translate that phrase into a retro-styled phrase, which includes some prominent 2000s-era slang. The idea is for users to hear/read the outputted phrase and have it remind them of the similar slang they used when they were kids. This helps them relate to Gen Alpha and understand them better, promoting relatability and kindness.

How we built it
A user can speak or type in a phrase with Gen Alpha slang. If spoken, the Web Speech API will turn it into text, which will be processed by the Gemini API. After some prompt engineering, I was able to prompt the Gemini API to translate the inputted phrase to return a slightly retro-styled phrase.

Challenges we ran into
Connecting the APIs to the web application was hard since it was my first time using APIs. It was also hard to work without a team. My original team of 4 dropped out within the hour that the Hackathon started, so I found another team of 3 to work with. However, after a few hours of brainstorming and starting work, they also decided not to continue due to their remaining homework and class commitments stressing them out. This lowered my morale, and it took a lot of courage to work on my own to submit a project.

Accomplishments that we're proud of
I'm really proud of having a speech and written input, as it increases accessibility. My web application color palette is also color-blind friendly with a high contrast ratio of 13.91:1, surpassing accessibility standards.

What we learned
I learned how to use APIs, which has always seemed like a daunting term, but is less so now! I had very minimal experience in React, so I got to practice that and use many new tools like Vite Project and others, which made it possible for me to run my project on my laptop.

What's next for What is my Kid Saying?
I would love to turn this into a mobile application for users to have easier access.
This application is not designed to be highly secure at the moment for the purposes of a short hackathon, but a much larger focus on security would be present in a longer-term project
There would be an expansion on the logic, and with enough time and knowledge, I would work with others to develop and train an AI/ML algorithm that learns slang and translates it according to current user input. This can differ from and exceed the knowledge the Gemini API currently has.
The speech-to-text and text-to-speech functionality would also be improved for a further streamlined user experience. - With time, I had also planned to add a data analytics feature, inspired by Spotify Wrapped, where users would see a recap of their most used words, their learnings, and other trends over time to highlight progress and the educational benefit of this product!

Built With
cs
elevenlabs
geminiapi
github
html
javascript
react
vscode
webspeechapi
