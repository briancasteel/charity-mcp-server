import { describe, it, expect } from '@jest/globals';
import { VERIFICATION_PROMPTS, handleVerificationPrompt } from './verification-prompts.js';
import { QUICK_REFERENCE_PROMPTS, handleQuickReferencePrompt } from './quick-reference-prompts.js';

describe('Charity Verification Prompts', () => {
  describe('VERIFICATION_PROMPTS', () => {
    it('should contain expected verification prompts', () => {
      expect(VERIFICATION_PROMPTS).toHaveLength(4);
      
      const promptNames = VERIFICATION_PROMPTS.map(p => p.name);
      expect(promptNames).toContain('charity_verification_guide');
      expect(promptNames).toContain('basic_legitimacy_workflow');
      expect(promptNames).toContain('red_flag_detection');
      expect(promptNames).toContain('verification_response_templates');
    });

    it('should have proper prompt structure', () => {
      VERIFICATION_PROMPTS.forEach(prompt => {
        expect(prompt).toHaveProperty('name');
        expect(prompt).toHaveProperty('description');
        expect(prompt).toHaveProperty('arguments');
        expect(typeof prompt.name).toBe('string');
        expect(typeof prompt.description).toBe('string');
        expect(Array.isArray(prompt.arguments)).toBe(true);
      });
    });
  });

  describe('QUICK_REFERENCE_PROMPTS', () => {
    it('should contain expected quick reference prompts', () => {
      expect(QUICK_REFERENCE_PROMPTS).toHaveLength(5);
      
      const promptNames = QUICK_REFERENCE_PROMPTS.map(p => p.name);
      expect(promptNames).toContain('quick_verification_reference');
      expect(promptNames).toContain('response_templates_quick');
      expect(promptNames).toContain('tool_selection_guide');
      expect(promptNames).toContain('common_keywords_reference');
      expect(promptNames).toContain('ai_assistant_best_practices');
    });

    it('should have proper prompt structure', () => {
      QUICK_REFERENCE_PROMPTS.forEach(prompt => {
        expect(prompt).toHaveProperty('name');
        expect(prompt).toHaveProperty('description');
        expect(prompt).toHaveProperty('arguments');
        expect(typeof prompt.name).toBe('string');
        expect(typeof prompt.description).toBe('string');
        expect(Array.isArray(prompt.arguments)).toBe(true);
      });
    });
  });

  describe('handleVerificationPrompt', () => {
    it('should handle charity_verification_guide prompt', async () => {
      const result = await handleVerificationPrompt('charity_verification_guide');
      
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('messages');
      expect(Array.isArray(result.messages)).toBe(true);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toHaveProperty('role', 'user');
      expect(result.messages[0].content).toHaveProperty('type', 'text');
      expect(result.messages[0].content.text).toContain('Charity Verification Guide');
    });

    it('should handle basic_legitimacy_workflow prompt with organization_name type', async () => {
      const result = await handleVerificationPrompt('basic_legitimacy_workflow', {
        verification_type: 'organization_name',
        organization_name: 'Test Charity'
      });
      
      expect(result.messages[0].content.text).toContain('Organization Name Verification Workflow');
      expect(result.messages[0].content.text).toContain('Test Charity');
    });

    it('should handle basic_legitimacy_workflow prompt with ein_verification type', async () => {
      const result = await handleVerificationPrompt('basic_legitimacy_workflow', {
        verification_type: 'ein_verification',
        ein: '12-3456789'
      });
      
      expect(result.messages[0].content.text).toContain('EIN-Based Verification Workflow');
      expect(result.messages[0].content.text).toContain('12-3456789');
    });

    it('should handle red_flag_detection prompt', async () => {
      const result = await handleVerificationPrompt('red_flag_detection', {
        status_type: 'revoked'
      });
      
      expect(result.messages[0].content.text).toContain('Red Flag Detection');
      expect(result.messages[0].content.text).toContain('Revoked Status Response');
    });

    it('should handle verification_response_templates prompt', async () => {
      const result = await handleVerificationPrompt('verification_response_templates', {
        outcome_type: 'verified'
      });
      
      expect(result.messages[0].content.text).toContain('✅ VERIFIED LEGITIMATE CHARITY');
    });

    it('should throw error for unknown prompt', async () => {
      await expect(handleVerificationPrompt('unknown_prompt'))
        .rejects.toThrow('Unknown verification prompt: unknown_prompt');
    });
  });

  describe('handleQuickReferencePrompt', () => {
    it('should handle quick_verification_reference prompt', async () => {
      const result = await handleQuickReferencePrompt('quick_verification_reference');
      
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('messages');
      expect(result.messages[0].content.text).toContain('Quick Charity Verification Reference');
    });

    it('should handle response_templates_quick prompt', async () => {
      const result = await handleQuickReferencePrompt('response_templates_quick', {
        template_type: 'verified'
      });
      
      expect(result.messages[0].content.text).toContain('✅ Verified Legitimate Template');
    });

    it('should handle tool_selection_guide prompt', async () => {
      const result = await handleQuickReferencePrompt('tool_selection_guide');
      
      expect(result.messages[0].content.text).toContain('Tool Selection Guide');
      expect(result.messages[0].content.text).toContain('Decision Tree');
    });

    it('should handle common_keywords_reference prompt', async () => {
      const result = await handleQuickReferencePrompt('common_keywords_reference');
      
      expect(result.messages[0].content.text).toContain('Common Keywords That Trigger Verification');
      expect(result.messages[0].content.text).toContain('Direct Verification Requests');
    });

    it('should handle ai_assistant_best_practices prompt', async () => {
      const result = await handleQuickReferencePrompt('ai_assistant_best_practices');
      
      expect(result.messages[0].content.text).toContain('AI Assistant Best Practices');
      expect(result.messages[0].content.text).toContain('Always Provide Context');
    });

    it('should throw error for unknown prompt', async () => {
      await expect(handleQuickReferencePrompt('unknown_prompt'))
        .rejects.toThrow('Unknown quick reference prompt: unknown_prompt');
    });
  });

  describe('Prompt Content Validation', () => {
    it('should generate proper workflow for suspicious organizations', async () => {
      const result = await handleVerificationPrompt('basic_legitimacy_workflow', {
        verification_type: 'suspicious_org',
        organization_name: 'Suspicious Charity'
      });
      
      const content = result.messages[0].content.text;
      expect(content).toContain('Suspicious Organization Verification Workflow');
      expect(content).toContain('NO MATCH FOUND');
      expect(content).toContain('MULTIPLE ORGANIZATIONS FOUND');
      expect(content).toContain('Single Clear Match');
    });

    it('should generate location-specific workflow', async () => {
      const result = await handleVerificationPrompt('basic_legitimacy_workflow', {
        verification_type: 'location_specific',
        organization_name: 'Local Charity',
        location: 'New York, NY'
      });
      
      const content = result.messages[0].content.text;
      expect(content).toContain('Location-Specific Verification Workflow');
      expect(content).toContain('New York, NY');
    });

    it('should generate proper response templates for different outcomes', async () => {
      const outcomes = ['verified', 'failed', 'conditional', 'not_found'];
      
      for (const outcome of outcomes) {
        const result = await handleVerificationPrompt('verification_response_templates', {
          outcome_type: outcome
        });
        
        const content = result.messages[0].content.text;
        if (outcome === 'verified') {
          expect(content).toContain('✅ VERIFIED LEGITIMATE CHARITY');
        } else if (outcome === 'failed') {
          expect(content).toContain('❌ VERIFICATION FAILED');
        } else if (outcome === 'conditional') {
          expect(content).toContain('⚠️ CONDITIONAL STATUS');
        } else if (outcome === 'not_found') {
          expect(content).toContain('⚠️ NO MATCH FOUND');
        }
      }
    });
  });
});
