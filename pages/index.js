import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [journalEntry, setJournalEntry] = useState('');
  const [story, setStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Split the textarea content by line breaks and filter out empty lines
      const entries = journalEntry
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate story');
      }

      const data = await response.json();
      setStory(data.story);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Journal Entry</h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.entryContainer}>
            <label htmlFor="journal-entry">
              Enter your journal entries (one per line):
            </label>
            <textarea
              id="journal-entry"
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="Enter your journal entries here, one per line..."
              required
              className={styles.textarea}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? 'Generating Story...' : 'Generate Story'}
          </button>
        </form>

        {story && (
          <div className={styles.storyContainer}>
            <h2>Generated Story</h2>
            <div className={styles.story}>{story}</div>
          </div>
        )}
      </main>
    </div>
  );
} 