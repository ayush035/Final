// lib/0g-compute.js
// REAL 0G Compute Integration for Browser
import { ethers } from 'ethers';

// Official 0G AI Model Provider (deepseek-r1-70b for complex reasoning)
const PROVIDER_ADDRESS = '0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3';

export class ZGComputeService {
  constructor() {
    this.broker = null;
    this.initialized = false;
    this.providerAcknowledged = false;
  }

  async initialize(walletClient) {
    if (this.initialized) return;

    // Only run in browser
    if (typeof window === 'undefined') {
      throw new Error('0G Compute only works in browser');
    }

    try {
      console.log('🚀 Initializing 0G Compute Broker...');
      
      // Dynamic import to load 0G SDK only in browser
      console.log('📦 Loading 0G Serving Broker SDK...');
      const { createZGComputeNetworkBroker } = await import('@0glabs/0g-serving-broker');
      console.log('✅ SDK loaded successfully');
      
      // Get the actual wallet/transport from wagmi
      const account = await walletClient.getAddresses();
      console.log('Connected account:', account[0]);
      
      // Create ethers provider and signer from wagmi wallet client
      console.log('🔗 Creating ethers provider...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      console.log('✅ Signer created:', await signer.getAddress());
      
      console.log('🔨 Creating 0G Compute broker with signer...');
      
      // Create broker instance
      this.broker = await createZGComputeNetworkBroker(signer);
      this.initialized = true;
      
      console.log('✅ 0G Compute Broker initialized successfully');
      console.log('Broker instance:', this.broker);
      
      // Check balance
      const balanceInfo = await this.checkBalance();
      
      if (balanceInfo.needsFunding) {
        console.warn('⚠️ Low 0G Compute balance. You may need to add funds.');
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize 0G Compute:', error);
      console.error('Error stack:', error.stack);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: error.code
      });
      throw new Error(`Failed to initialize 0G Compute: ${error.message}`);
    }
  }

  async checkBalance() {
    if (!this.broker) throw new Error('Broker not initialized');
    
    try {
      const account = await this.broker.ledger.getLedger();
      const balance = ethers.formatEther(account.totalBalance);
      console.log(`💰 0G Compute Balance: ${balance} 0G`);
      
      // Check if balance is too low (less than 0.01 0G)
      if (parseFloat(balance) < 0.01) {
        console.warn('⚠️ Low balance! Consider adding funds.');
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
      console.log(`💸 Adding ${amount} 0G tokens to compute account...`);
      await this.broker.ledger.addLedger(amount);
      console.log('✅ Funds added successfully');
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
      console.log('🤝 Acknowledging provider on-chain...');
      await this.broker.inference.acknowledgeProviderSigner(PROVIDER_ADDRESS);
      this.providerAcknowledged = true;
      console.log('✅ Provider acknowledged successfully');
    } catch (error) {
      console.error('Error acknowledging provider:', error);
      // Provider might already be acknowledged, continue anyway
      console.log('ℹ️ Continuing - provider may already be acknowledged');
      this.providerAcknowledged = true;
    }
  }

  async generatePollIdea(imageDescription, imageFile) {
    if (!this.broker) throw new Error('Broker not initialized');

    try {
      console.log('🔗 Ensuring provider is acknowledged...');
      await this.acknowledgeProvider();

      // Get service metadata (endpoint and model info)
      console.log('📡 Getting 0G Compute service metadata...');
      const { endpoint, model } = await this.broker.inference.getServiceMetadata(PROVIDER_ADDRESS);
      
      console.log(`🤖 Using AI Model: ${model}`);
      console.log(`🌐 Endpoint: ${endpoint}`);

      // Create prompt for AI
      const prompt = this.createPollPrompt(imageDescription, imageFile.name);
      const messages = [{ role: "user", content: prompt }];

      // Generate authenticated request headers
      console.log('🔐 Generating authenticated headers...');
      const headers = await this.broker.inference.getRequestHeaders(
        PROVIDER_ADDRESS,
        JSON.stringify(messages)
      );

      // Send request to 0G Compute AI
      console.log('🚀 Sending request to 0G Compute AI...');
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
        const errorText = await response.text();
        throw new Error(`AI request failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      const chatID = data.id;

      console.log('✅ AI Response received:', aiResponse);

      // Verify response using TEE verification
      console.log('🔒 Verifying response with TEE...');
      const isValid = await this.broker.inference.processResponse(
        PROVIDER_ADDRESS,
        aiResponse,
        chatID
      );

      console.log(`${isValid ? '✅ Response VERIFIED' : '⚠️ Response UNVERIFIED'}`);

      // Parse the AI response into structured poll data
      const pollIdea = this.parsePollIdea(aiResponse);

      return {
        ...pollIdea,
        verified: isValid,
        chatID,
        rawResponse: aiResponse,
        provider: PROVIDER_ADDRESS,
        model,
      };

    } catch (error) {
      console.error('❌ Error generating poll idea:', error);
      throw new Error(`Failed to generate poll: ${error.message}`);
    }
  }

  createPollPrompt(imageDescription, fileName) {
    return `You are a creative poll generator for a social media platform. Based on this image information, generate ONE engaging poll question with exactly 4 answer options.

Image Details:
- Filename: ${fileName}
- Type: ${imageDescription || 'User uploaded image'}

Requirements:
1. Create ONE interesting poll question that people would want to vote on
2. Provide exactly 4 creative, diverse answer options
3. Make it fun and engaging - use emojis if appropriate
4. Keep options concise (max 40 characters each)
5. Format EXACTLY as JSON (no markdown, no extra text):

{
  "question": "Your engaging poll question here?",
  "options": ["Option 1 with emoji 🎨", "Option 2 💯", "Option 3 ✨", "Option 4 🔥"]
}

Return ONLY the JSON object, nothing else.`;
  }

  parsePollIdea(aiResponse) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate the structure
        if (parsed.question && Array.isArray(parsed.options) && parsed.options.length >= 3) {
          return {
            question: parsed.question.trim(),
            options: parsed.options.slice(0, 4).map(opt => opt.trim()),
          };
        }
      }
    } catch (error) {
      console.error('Error parsing AI JSON response:', error);
    }

    // Fallback parsing if JSON extraction fails
    return this.fallbackParsePollIdea(aiResponse);
  }

  fallbackParsePollIdea(aiResponse) {
    console.log('Using fallback parser for AI response');
    
    // Try to find a question (ends with ?)
    const questionMatch = aiResponse.match(/[^.!?]*\?/);
    const question = questionMatch 
      ? questionMatch[0].trim() 
      : 'What do you think about this image?';

    // Try to find numbered or bulleted options
    const optionMatches = aiResponse.match(/(?:^|\n)\s*(?:\d+[\.)]\s*|[-*•]\s*)(.+?)(?=\n|$)/gm);
    
    let options;
    if (optionMatches && optionMatches.length >= 3) {
      options = optionMatches
        .slice(0, 4)
        .map(opt => opt.replace(/^\s*(?:\d+[\.)]\s*|[-*•]\s*)/, '').trim());
    } else {
      // Ultimate fallback
      options = [
        'Love it! 🔥',
        'Pretty cool 👍',
        'It\'s okay 😐',
        'Not for me 🤷'
      ];
    }

    return { question, options };
  }

  async listAvailableServices() {
    if (!this.broker) throw new Error('Broker not initialized');
    
    try {
      const services = await this.broker.inference.listService();
      console.log('📋 Available 0G Compute services:', services);
      return services;
    } catch (error) {
      console.error('Error listing services:', error);
      return [];
    }
  }
}

// Create and export a single instance
export const zgCompute = new ZGComputeService();