const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chat = require('../models/Chat');
const User = require('../models/User');
const DailyEntry = require('../models/DailyEntry');

// Fallback rule-based coach responder
const getFallbackCoachResponse = (message, user, latestEntry) => {
  const msg = message.toLowerCase();
  
  // Custom context variables
  const name = user.name.split(' ')[0];
  const sleepHrs = latestEntry ? latestEntry.sleepDuration : 6.5;
  const stress = latestEntry ? latestEntry.stressLevel : 5;
  const quality = latestEntry ? latestEntry.sleepQuality : 6;
  const steps = latestEntry ? latestEntry.dailySteps : 6000;

  // Response templates
  if (msg.includes('5 hours') || msg.includes('sleep less') || msg.includes('short sleep') || msg.includes('sleep only')) {
    return `Hi ${name}, sleeping only ${sleepHrs} hours is below the recommended 7-9 hours for adults. This can impact your cognitive function, immunity, and overall energy.

Here is some custom advice based on your profile:
* **Sleep Advice**: Aim to increase sleep duration gradually by 15-minute increments. Try setting a strict bedtime alarm.
* **Bedtime Routine**: Avoid digital screens (phones, TVs) at least 1 hour before sleeping. The blue light suppresses melatonin production.
* **Exercise Suggestions**: Engaged in moderate physical activity like walking or cycling earlier in the day. Refrain from intense workouts within 3 hours of sleep.
* **Stress Management**: Since your recent stress level is logged at ${stress}/10, try a 5-minute deep breathing exercise (4-7-8 method) right before bed to soothe your nervous system.
* **Meditation Tips**: Use guided imagery or progressive muscle relaxation (PMR) in bed.
* **Foods for Better Sleep**: Try foods rich in tryptophan or magnesium, such as chamomile tea, walnuts, or a banana in the evening. Avoid caffeine after 2 PM.`;
  }

  if (msg.includes('tired') || msg.includes('fatigued') || msg.includes('exhausted') || msg.includes('morning')) {
    return `Hello ${name}. Feeling tired in the morning even after sleep is very common and can stem from multiple factors. Looking at your records (Sleep Quality: ${quality}/10, Stress: ${stress}/10):

### Possible Reasons:
1. **High Stress levels**: Logged at ${stress}/10, which keeps your cortisol levels high and prevents deep, restorative slow-wave sleep.
2. **Irregular Sleep Schedule**: Inconsistent bedtimes disrupt your circadian rhythm.
3. **Poor Sleep Quality**: Light sleep cycles rather than REM and Deep sleep stages.

### Recommendations:
* **Circadian Alignment**: Try to sleep before 11:00 PM and wake up at the exact same time every day, including weekends.
* **Morning Sun**: Expose your eyes to natural sunlight within 15 minutes of waking. This halts melatonin production and boosts morning alertness.
* **Daily Movement**: Ensure you complete your daily activity goal. Your steps are around ${steps.toLocaleString()}. Getting closer to 10,000 steps will naturally improve sleep depth.
* **Hydration**: Drink a glass of water immediately after waking. Dehydration is a major cause of morning fatigue.`;
  }

  if (msg.includes('caffeine') || msg.includes('coffee') || msg.includes('tea')) {
    return `Hi ${name}, coffee and tea contain caffeine, a central nervous system stimulant that blocks adenosine receptors in your brain (the chemical that makes you feel sleepy).

* **The 10-Hour Rule**: Caffeine has a half-life of 5-8 hours and a quarter-life of up to 12 hours. Avoid caffeine for at least 10 hours before your planned bedtime.
* **Swap Recommendations**: Switch to herbal infusions like Chamomile, Peppermint, or Valerian Root tea after 2 PM.
* **Limit Intake**: Keep daily coffee intake under 2-3 cups, logged early in the morning.`;
  }

  if (msg.includes('stress') || msg.includes('anxious') || msg.includes('worry')) {
    return `Hi ${name}. Stress (currently logged at ${stress}/10) is a major trigger for hyperarousal, making it difficult to fall asleep.

* **Worry Journaling**: Spend 5 minutes writing down all your thoughts, tasks, and concerns in a "worry journal" 2 hours before bed. This signals to your brain that it is safe to rest.
* **Breathing Exercise**: Try the **4-7-8 Breathing Technique**:
  1. Inhale quietly through your nose for 4 seconds.
  2. Hold your breath for 7 seconds.
  3. Exhale completely through your mouth making a whoosh sound for 8 seconds.
  4. Repeat this cycle 4 times.
* **Environment**: Keep your bedroom cool (around 18°C / 65°F), quiet, and pitch-black.`;
  }

  // Generic welcoming/guiding response
  return `Hello ${name}! I'm your SleepSync Coach. How can I help you improve your sleep today?

You can ask me questions like:
* *"I sleep only 5 hours. What should I do?"*
* *"Why do I feel tired every morning?"*
* *"How does stress affect my sleep score?"*
* *"Can coffee affect my sleep quality?"*

Based on your current health stats (BMI: ${user.bmi}, Occupation: ${user.occupation}, Sleep Score: ${latestEntry ? latestEntry.sleepScore : 'N/A'}), I am here to provide customized exercise, bedtime, and sleep advice!`;
};

// Send Message and get AI Coaching response
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // 1. Fetch user data and latest entry for context
    const user = await User.findById(userId);
    const latestEntry = await DailyEntry.findOne({ userId }).sort({ date: -1 });

    // 2. Fetch or create chat history
    let chatSession = await Chat.findOne({ userId });
    if (!chatSession) {
      chatSession = new Chat({ userId, messages: [] });
    }

    // Append user message
    chatSession.messages.push({ role: 'user', content: message });

    let responseText = '';
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey && geminiKey !== 'YOUR_GEMINI_API_KEY') {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        // Build context for system prompt
        const systemPrompt = `You are SleepSync Coach, an empathetic, professional AI sleep quality and lifestyle coach.
The user is ${user.name}, a ${user.age}-year-old ${user.gender} working as a ${user.occupation}. Their BMI is ${user.bmi || 'N/A'}.
${latestEntry ? `Their latest daily health log on ${latestEntry.date}:
- Sleep Duration: ${latestEntry.sleepDuration} hours
- Sleep Quality: ${latestEntry.sleepQuality}/10
- Stress Level: ${latestEntry.stressLevel}/10
- Steps: ${latestEntry.dailySteps}
- Mood: ${latestEntry.mood}
- Physical Activity: ${latestEntry.physicalActivity} minutes` : 'They have not logged any sleep data today.'}

Instructions:
1. Provide highly customized, scientific advice covering sleep hygiene, diet, routines, stress management, and exercise.
2. Refer to the user by their first name, ${user.name.split(' ')[0]}.
3. Structure your response using clear bullet points and markdown.
4. Keep the response concise, friendly, and actionable (aim for 3-5 short paragraphs max).
5. If the user asks general or irrelevant questions, gently steer them back to sleep and wellness topics.`;

        // Using standard flash model with system instruction
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          systemInstruction: systemPrompt
        });

        // Format history for Gemini chat API
        // Only take the last 10 messages to keep request context small and fast
        const chatHistory = chatSession.messages.slice(-10, -1).map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }));

        // Combine system prompt with the message or use startChat
        const chat = model.startChat({
          history: chatHistory
        });

        const result = await chat.sendMessage(message);
        responseText = result.response.text();
      } catch (geminiError) {
        console.error('Gemini API call failed, falling back to rule-based agent:', geminiError.message);
        responseText = getFallbackCoachResponse(message, user, latestEntry);
      }
    } else {
      // Use fallback responder if no key is set
      responseText = getFallbackCoachResponse(message, user, latestEntry);
    }

    // Append model response
    chatSession.messages.push({ role: 'model', content: responseText });
    await chatSession.save();

    res.status(200).json({
      reply: responseText,
      history: chatSession.messages
    });
  } catch (error) {
    console.error('Coach sendMessage Error:', error);
    res.status(500).json({ error: 'AI Coach failed to respond. Please try again.' });
  }
};

// Retrieve chat history
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    let chatSession = await Chat.findOne({ userId });

    if (!chatSession) {
      // Return empty list
      return res.status(200).json({ messages: [] });
    }

    res.status(200).json({ messages: chatSession.messages });
  } catch (error) {
    console.error('Get Chat History Error:', error);
    res.status(500).json({ error: 'Failed to retrieve conversation history' });
  }
};

module.exports = { sendMessage, getChatHistory };
