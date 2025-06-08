import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [entries, setEntries] = useState([{ content: '' }]);
  const [story, setStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddEntry = () => {
    setEntries([...entries, { content: '' }]);
  };

  const handleEntryChange = (index, value) => {
    const newEntries = [...entries];
    newEntries[index].content = value;
    setEntries(newEntries);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Process entries to split by line breaks
      const processedEntries = entries.map(entry => ({
        entries: entry.content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0) // Remove empty lines
      }));

      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries: processedEntries }),
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
        <h1 className={styles.title}>Weekly Journal Entries</h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {entries.map((entry, index) => (
            <div key={index} className={styles.entryContainer}>
              <label htmlFor={`entry-${index}`}>
                Week {index + 1} Journal Entry:
              </label>
              <textarea
                id={`entry-${index}`}
                value={entry.content}
                onChange={(e) => handleEntryChange(index, e.target.value)}
                placeholder="Enter your journal entry for this week..."
                required
                className={styles.textarea}
              />
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddEntry}
            className={styles.addButton}
          >
            Add Another Week
          </button>
          
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