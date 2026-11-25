import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceSearchHook {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  errorMessage: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useVoiceSearch(onResult?: (text: string) => void): VoiceSearchHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Indian English / general speech

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMessage(null);
    };

    recognition.onresult = (event: any) => {
      let currentText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentText += event.results[i][0].transcript;
      }
      setTranscript(currentText);
      if (event.results[0].isFinal) {
        if (onResult && currentText.trim()) {
          onResult(currentText.trim());
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('[VoiceSearch] Speech error:', event.error);
      if (event.error === 'not-allowed') {
        setErrorMessage('Microphone access was denied. Please check your browser permissions.');
      } else if (event.error === 'no-speech') {
        setErrorMessage('No speech detected. Please tap mic and try again.');
      } else {
        setErrorMessage(`Voice search error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [isSupported, onResult]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setErrorMessage('Speech recognition is not supported in this browser. Please type to search.');
      return;
    }
    setTranscript('');
    setErrorMessage(null);
    setIsListening(true);
    try {
      recognitionRef.current?.start();
    } catch (err: any) {
      console.warn('[VoiceSearch] Already started or busy:', err);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {}
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setErrorMessage(null);
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    errorMessage,
    startListening,
    stopListening,
    resetTranscript
  };
}
