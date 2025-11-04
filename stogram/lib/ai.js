// lib/0g-compute.js
import { ethers } from 'ethers';

// Official 0G AI Model Provider (deepseek-r1-70b for complex reasoning)
const PROVIDER_ADDRESS = '0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3';

// Mock AI Service for browser compatibility fallback
class MockAIService {
  constructor() {
    this.initialized = false;
    this.isMock = true;
  }

  async initialize(walletClient) {
    console.log('⚠️ Using 0G Compute SDK)');
    this.initialized = true;
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async checkBalance() {
    return { balance: '10.0', needsFunding: false };
  }

  async addFunds(amount) {
    console.log('Adding funds', amount);
    return true;
  }

  async acknowledgeProvider() {
    console.log('Provider acknowledged');
  }

  async generatePollIdea(imageDescription, imageFile) {
    console.log('Generating poll for', imageFile.name);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const pollTemplates = [
      {
        question: "What's your first impression of this image?",
        options: ["Amazing! 🔥", "Pretty good 👍", "Could be better 🤔", "Not my style 🙈"]
      },
      {
        question: "How would you rate this photo?",
        options: ["5 stars ⭐⭐⭐⭐⭐", "4 stars ⭐⭐⭐⭐", "3 stars ⭐⭐⭐", "Needs work 📸"]
      },
      {
        question: "What mood does this image give you?",
        options: ["Happy & Energetic ☀️", "Calm & Peaceful 🌊", "Mysterious 🌙", "Nostalgic 📷"]
      },
      {
        question: "Would you share this image?",
        options: ["Absolutely! 🔥", "Maybe with friends 👥", "Probably not 🤷", "Definitely not ❌"]
      },
      {
        question: "What's the best thing about this image?",
        options: ["The colors 🎨", "The composition 📐", "The subject 👤", "The overall vibe ✨"]
      },
      {
        question: "If this image was a song, what genre would it be?",
        options: ["Pop 🎵", "Rock 🎸", "Jazz 🎷", "Classical 🎻"]
      },
      {
        question: "What time of day does this remind you of?",
        options: ["Morning sunrise 🌅", "Bright afternoon ☀️", "Golden hour 🌇", "Night vibes 🌙"]
      },
      {
        question: "Which emoji best describes this image?",
        options: ["🔥 Fire", "💯 Perfect", "✨ Magical", "🎨 Artistic"]
      }
    ];

    // Pick a random template
    const randomPoll = pollTemplates[Math.floor(Math.random() * pollTemplates.length)];

    return {
      question: randomPoll.question,
      options: randomPoll.options,
      verified: false,
      chatID: 'mock-' + Date.now(),
      rawResponse: JSON.stringify(randomPoll),
      isMock: true, // Flag to show this is mock data
    };
  }

  async listAvailableServices() {
    return [
      {
        provider: 'mock-provider',
        model: 'mock-ai-v1',
        serviceType: 'inference',
      }
    ];
  }
}

// Real 0G Compute Service (not browser-compatible yet)
class ZGComputeService {
  constructor() {
    this.broker = null;
    this.initialized = false;
    this.providerAcknowledged = false;
    this.createBroker = null;
    this.isMock = false;
  }

  async initialize(walletClient) {
    if (this.initialized) return;

    if (typeof window === 'undefined') {
      throw new Error('0G Compute only works in browser');
    }

    try {
      console.log('Initializing 0G Compute Broker...');
      
      if (!this.createBroker) {
        const module = await import('@0glabs/0g-serving-broker');
        this.createBroker = module.createZGComputeNetworkBroker;
      }
      
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      
      this.broker = await this.createBroker(signer);
      this.initialized = true;
      
      console.log('0G Compute Broker initialized successfully');
      await this.checkBalance();
      
    } catch (error) {
      console.error('Failed to initialize 0G Compute:', error);
      throw new Error(`Failed to initialize 0G Compute: ${error.message}`);
    }
  }

  async checkBalance() {
    if (!this.broker) throw new Error('Broker not initialized');
    
    try {
      const account = await this.broker.ledger.getLedger();
      const balance = ethers.formatEther(account.totalBalance);
      console.log(`0G Compute Balance: ${balance} 0G`);
      
      if (parseFloat(balance) < 0.1) {
        console.warn('Low balance! Consider adding funds.');
        return { balance, needsFunding: true };
      }
      
      return { balance, needsFunding: false };
    } catch (error) {
      console.error('Error checking balance:', error);
      return { balance: '0', needsFunding: true };
    }
  }

  async addFunds(amount) {
    if (!this.broker) throw new Error('Broker not initialized');
    
    try {
      console.log(`Adding ${amount} 0G tokens to account...`);
      await this.broker.ledger.addLedger(amount);
      console.log('Funds added successfully');
      return true;
    } catch (error) {
      console.error('Error adding funds:', error);
      throw new Error(`Failed to add funds: ${error.message}`);
    }
  }

  async acknowledgeProvider() {
    if (!this.broker) throw new Error('Broker not initialized');
    if (this.providerAcknowledged) return;

    try {
      console.log('Acknowledging provider on-chain...');
      await this.broker.inference.acknowledgeProviderSigner(PROVIDER_ADDRESS);
      this.providerAcknowledged = true;
      console.log('Provider acknowledged successfully');
    } catch (error) {
      console.error('Error acknowledging provider:', error);
      console.log('Continuing anyway - provider may already be acknowledged');
      this.providerAcknowledged = true;
    }
  }

  async generatePollIdea(imageDescription, imageFile) {
    if (!this.broker) throw new Error('Broker not initialized');

    try {
      await this.acknowledgeProvider();

      console.log('Getting service metadata...');
      const { endpoint, model } = await this.broker.inference.getServiceMetadata(PROVIDER_ADDRESS);
      
      console.log(`Using model: ${model} at ${endpoint}`);

      const prompt = this.createPollPrompt(imageDescription, imageFile.name);
      const messages = [{ role: "user", content: prompt }];

      console.log('Generating request headers...');
      const headers = await this.broker.inference.getRequestHeaders(
        PROVIDER_ADDRESS,
        JSON.stringify(messages)
      );

      console.log('Sending request to 0G Compute AI...');
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          ...headers 
        },
        body: JSON.stringify({
          messages: messages,
          model: model,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      const chatID = data.id;

      console.log('AI Response received:', aiResponse);

      console.log('Verifying response...');
      const isValid = await this.broker.inference.processResponse(
        PROVIDER_ADDRESS,
        aiResponse,
        chatID
      );

      console.log(`Response verification: ${isValid ? 'VALID' : 'UNVERIFIED'}`);

      const pollIdea = this.parsePollIdea(aiResponse);

      return {
        ...pollIdea,
        verified: isValid,
        chatID,
        rawResponse: aiResponse,
        isMock: false,
      };

    } catch (error) {
      console.error('Error generating poll idea:', error);
      throw new Error(`Failed to generate poll: ${error.message}`);
    }
  }

  createPollPrompt(imageDescription, fileName) {
    return `You are a creative poll generator. Based on the following image information, generate an engaging poll question with 3-4 answer options.

Image Details:
- Filename: ${fileName}
- Description: ${imageDescription || 'User uploaded image'}

Requirements:
1. Create ONE interesting poll question related to the image
2. Provide 3-4 creative answer options
3. Make it engaging and fun
4. Format your response EXACTLY as JSON:

{
  "question": "Your poll question here?",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
}

Generate the poll now:`;
  }

  parsePollIdea(aiResponse) {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          question: parsed.question || 'What do you think about this image?',
          options: parsed.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }

    return this.fallbackParsePollIdea(aiResponse);
  }

  fallbackParsePollIdea(aiResponse) {
    const questionMatch = aiResponse.match(/^(.+\?)/m);
    const question = questionMatch 
      ? questionMatch[1].trim() 
      : 'What do you think about this image?';

    const optionMatches = aiResponse.match(/(?:^|\n)\s*(?:\d+\.|[-*•])\s*(.+?)(?=\n|$)/gm);
    const options = optionMatches && optionMatches.length >= 3
      ? optionMatches.slice(0, 4).map(opt => opt.replace(/^\s*(?:\d+\.|[-*•])\s*/, '').trim())
      : ['Amazing!', 'Interesting', 'Could be better', 'Not sure'];

    return { question, options };
  }

  async listAvailableServices() {
    if (!this.broker) throw new Error('Broker not initialized');
    
    try {
      const services = await this.broker.inference.listService();
      console.log('Available 0G Compute services:', services);
      return services;
    } catch (error) {
      console.error('Error listing services:', error);
      return [];
    }
  }
}

// Auto-detect which service to use
class ComputeServiceFactory {
  static async createService() {
    // For now, always use mock since 0G SDK isn't browser-compatible
    // When 0G releases browser-compatible version, we can add detection logic here
    console.log('🤖 AI Service: Using mock service (0G SDK not browser-ready yet)');
    return new MockAIService();
    
    // Uncomment when 0G releases browser version:
    // try {
    //   const service = new ZGComputeService();
    //   return service;
    // } catch (error) {
    //   console.warn('Falling back to mock AI service');
    //   return new MockAIService();
    // }
  }
}

// Export factory function
export const createComputeService = ComputeServiceFactory.createService;

// Export singleton instance (mock for now)
export const zgCompute = new MockAIService();

// Export both classes for manual selection
export { ZGComputeService, MockAIService };