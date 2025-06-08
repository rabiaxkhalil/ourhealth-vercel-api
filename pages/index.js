import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import '../styles/globals.css';

export default function Home() {
  const [journalEntry, setJournalEntry] = useState('');
  const [story, setStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechSynthesisRef = useRef(null);
  const bookRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startNarration = () => {
    if (!story) return;
    
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(story);
    utterance.rate = 0.9; // Slightly slower for better clarity
    utterance.pitch = 1.1; // Slightly higher pitch for a friendly voice
    utterance.volume = 1;

    // Get available voices and set a child-friendly voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Samantha') || 
      voice.name.includes('Microsoft')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopNarration = () => {
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
        }
        setHasRecording(true);
        setIsRecording(false);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const playRecording = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const downloadAsImage = async () => {
    if (!bookRef.current) return;

    try {
      const canvas = await html2canvas(bookRef.current, {
        scale: 2, // Higher quality
        backgroundColor: null,
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'my-story.png';
      link.href = image;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    }
  };

  const downloadAsPDF = async () => {
    if (!bookRef.current) return;

    try {
      const canvas = await html2canvas(bookRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('my-story.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="container">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#FFB5C2', '#A7C7E7', '#C1E1C1', '#FFE5B4', '#E0BBE4']}
        />
      )}
      
      <motion.main 
        className="main"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="title"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Journal Entry
        </motion.h1>
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.div 
            className="entryContainer"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <label htmlFor="journal-entry">
              Enter your journal entries (one per line):
            </label>
            <textarea
              id="journal-entry"
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="Enter your journal entries here, one per line..."
              required
              className="textarea"
            />
          </motion.div>
          
          <motion.button
            type="submit"
            disabled={isLoading}
            className="submitButton"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {isLoading ? 'Generating Story...' : 'Generate Story'}
          </motion.button>
        </motion.form>

        <AnimatePresence>
          {story && (
            <motion.div 
              className="storyContainer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h2
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                Your Story
              </motion.h2>
              <motion.div 
                className="bookFrame"
                initial={{ rotateY: 90 }}
                animate={{ rotateY: 0 }}
                transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
                ref={bookRef}
              >
                <div className="bookSpine" />
                <div className="bookCorner bookCornerTopLeft" />
                <div className="bookCorner bookCornerTopRight" />
                <div className="bookCorner bookCornerBottomLeft" />
                <div className="bookCorner bookCornerBottomRight" />
                <motion.div 
                  className="bookPages"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <div className="story">{story}</div>
                </motion.div>
              </motion.div>

              <div className="audioControls">
                <motion.button
                  onClick={isPlaying ? stopNarration : startNarration}
                  className="audioButton"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPlaying ? '⏹️ Stop AI Narration' : '🔊 Play AI Narration'}
                </motion.button>

                <motion.button
                  onClick={isRecording ? stopRecording : startRecording}
                  className="audioButton"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isRecording ? '⏹️ Stop Recording' : '🎤 Record Parent Voice'}
                </motion.button>

                {hasRecording && (
                  <motion.button
                    onClick={playRecording}
                    className="audioButton"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🔊 Play Parent Recording
                  </motion.button>
                )}
              </div>

              <div className="downloadControls">
                <motion.button
                  onClick={downloadAsImage}
                  className="downloadButton"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📸 Download as Image
                </motion.button>

                <motion.button
                  onClick={downloadAsPDF}
                  className="downloadButton"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📄 Download as PDF
                </motion.button>
              </div>

              <audio ref={audioRef} className="hidden" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
} 