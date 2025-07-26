// AI Service Integration for Community Platform
const OpenAI = require("openai");
require("dotenv").config();

class AIService {
  constructor() {
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY.includes("replace-with-your-real")
    ) {
      console.warn(
        "OpenAI API key is not configured. AI services will be disabled."
      );
      this.openai = null;
    } else {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  // Helper to check if the service is available
  isAvailable() {
    return this.openai !== null;
  }

  // AI Chatbot for community support
  async getChatbotReply(message, user, history = []) {
    if (!this.isAvailable()) {
      return "I am currently offline. Please try again later.";
    }

    try {
      const systemPrompt = `You are a friendly and helpful AI assistant for a community platform. Your name is 'CommuniBot'.
      The user you are talking to is ${user.username}. Their role is ${
        user.role
      }.
      Their interests include: ${user.interests?.join(", ") || "not specified"}.
      Their skills include: ${user.skills?.join(", ") || "not specified"}.
      Be concise and helpful. Ask clarifying questions if needed. Do not invent features that don't exist.
      The platform has: Discussions, Q&A, Milestones, and Mentorship sections.
      You can help users find information, suggest connections, or answer questions about the platform.`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message },
      ];

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7,
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error("AI Chatbot error:", error);
      if (error.status === 401) {
        return "There is an issue with the AI service configuration.";
      }
      if (error.status === 429) {
        throw error; // Re-throw to be handled by the route
      }
      return "I'm sorry, I'm having trouble responding right now. Please try again later.";
    }
  }

  // Content recommendation based on user interests
  async getContentRecommendations(userProfile, availablePosts) {
    if (!this.isAvailable()) {
      return this.getFallbackRecommendations();
    }

    try {
      const postSummaries = availablePosts.map((post) => ({
        id: post._id,
        content: post.content.substring(0, 150),
        author: post.author.username,
      }));

      const prompt = `
        Based on the profile of user "${
          userProfile.username
        }", recommend 3-5 relevant posts from the list below.
        The user's interests are: ${
          userProfile.interests?.join(", ") || "General"
        }.
        The user's skills are: ${userProfile.skills?.join(", ") || "General"}.

        Available Posts:
        ${JSON.stringify(postSummaries, null, 2)}

        Respond with a JSON array of objects, where each object has:
        - "id": The ID of the recommended post.
        - "title": A short, catchy title for the recommendation card.
        - "reason": A brief, one-sentence explanation of why this post is relevant for the user.
        - "link": The link should be "#" for now.

        Example response:
        [
          { "id": "60d21b4667d0d8992e610c85", "title": "Deep Dive into Node.js", "reason": "Matches your interest in backend development.", "link": "#" }
        ]
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 500,
        temperature: 0.5,
      });

      const content = completion.choices[0].message.content;
      // The model is instructed to return a JSON object with a key (e.g., "recommendations"), so we parse and access it.
      const result = JSON.parse(content);
      return result.recommendations || result; // Handle if the model wraps it in a key
    } catch (error) {
      console.error("Content recommendation error:", error);
      // Return fallback recommendations for any error
      return this.getFallbackRecommendations();
    }
  }

  getFallbackRecommendations() {
    return [
      {
        id: "1",
        title: "Explore Discussions",
        reason: "Discover what the community is talking about.",
        link: "#",
      },
      {
        id: "2",
        title: "Find a Mentor",
        reason: "Connect with experienced members to guide you.",
        link: "#",
      },
      {
        id: "3",
        title: "Ask a Question",
        reason: "Get answers to your questions from the community.",
        link: "#",
      },
    ];
  }

  // Smart mentor matching
  async findBestMentors(userProfile, availableMentors) {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const prompt = `
        User profile:
        - Interests: ${userProfile.interests?.join(", ") || "None"}
        - Skills: ${userProfile.skills?.join(", ") || "None"}
        - Bio: ${userProfile.bio || "None"}

        Available mentors:
        ${availableMentors
          .map(
            (m) =>
              `- ID: ${m._id}, Skills: ${m.skills?.join(
                ", "
              )}, Expertise: ${m.expertise?.join(", ")}`
          )
          .join("\n")}

        Match the user with the top 3 most suitable mentors. Return a JSON array of objects with mentor IDs and a brief reason for the match.
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error("Mentor matching error:", error);
      return [];
    }
  }

  // Auto-generate tags for posts
  async generateTagsForPost(postContent) {
    if (!this.isAvailable()) {
      return ["general"];
    }

    try {
      const prompt = `
        Generate 3-5 relevant tags for the following post content.
        The tags should be single words or short phrases, lowercase.
        Return the tags as a JSON array of strings.

        Post content: "${postContent}"

        Example response:
        ["javascript", "web-development", "api", "question"]
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 100,
        temperature: 0.3,
      });

      const content = completion.choices[0].message.content;
      const result = JSON.parse(content);
      return result.tags || result; // Handle if the model wraps it in a key
    } catch (error) {
      console.error("Tag generation error:", error);
      return ["general", "discussion"];
    }
  }
}

module.exports = new AIService();
