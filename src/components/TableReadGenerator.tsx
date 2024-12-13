"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Copy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const CLAUDE_PROMPT = `You are generating a dramatic scene for a table read party game. This should be entertaining and engaging, usually hilarious, taking approximately 5 minutes to read out loud at a natural pace.

Follow these rules:
1. Write in standard screenplay format
2. Include clear stage directions in parentheses
3. Keep lines natural and performable
4. Make sure each character gets roughly equal speaking time
5. Include moments of both dialogue and action
6. Make it approximately 2-3 pages of script
7. Create distinct personality traits for each character
8. Don't preface the scene with a response to this prompt, just start with the scene.

STYLE: {{style}}
NUMBER OF CHARACTERS: {{numPlayers}}
{{#if plot}}PLOT OUTLINE: {{plot}}{{/if}}

Generate a complete scene that matches these requirements. The scene should be self-contained with a clear beginning, middle, and end.`;

const TableReadGenerator = () => {
  const [numPlayers, setNumPlayers] = useState(2);
  const [style, setStyle] = useState('');
  const [plot, setPlot] = useState('');
  const [script, setScript] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const generateScript = async () => {
    setGenerating(true);
    setError('');
    
    try {
      const prompt = CLAUDE_PROMPT
        .replace('{{style}}', style)
        .replace('{{numPlayers}}', numPlayers.toString())
        .replace('{{#if plot}}PLOT OUTLINE: {{plot}}{{/if}}', 
          plot ? `PLOT OUTLINE: ${plot}` : '');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          messages: [{
            role: "user",
            content: prompt
          }],
          max_tokens: 4000,
          temperature: 0.7
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate script');
      }

      setScript(data.content[0].text);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate script';
      setError(`${errorMessage}. Please try again.`);
      console.error('Generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Table Read Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="players">Number of Players</Label>
            <Input
              id="players"
              type="number"
              min="2"
              max="5"
              value={numPlayers}
              onChange={(e) => setNumPlayers(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="style">Style Description</Label>
            <Input
              id="style"
              placeholder="e.g., Wes Anderson-style with dry humor and ornate dialogue"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="plot">Scene Plot (Optional)</Label>
            <Textarea
              id="plot"
              placeholder="A tense confrontation in an antique shop..."
              value={plot}
              onChange={(e) => setPlot(e.target.value)}
              className="w-full"
            />
          </div>

          <Button 
            onClick={generateScript}
            disabled={generating || !style}
            className="w-full"
          >
            {generating ? 'Writing your scene...' : 'Generate Scene'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {script && (
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Your Scene</h3>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <pre className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap font-mono text-sm">
                {script}
              </pre>
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Style Tips</AlertTitle>
            <AlertDescription>
              Try specific prompts like "Sorkin-style rapid-fire dialogue about mundane topics" or "Kubrick-esque psychological tension with long pauses"
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default TableReadGenerator;