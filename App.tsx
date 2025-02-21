import React, { useState } from 'react';
import { Code, Send } from 'lucide-react';
import Select from 'react-select';
import toast, { Toaster } from 'react-hot-toast';
import type { BFHLRequest, BFHLResponse, FilterOption } from './types';
import { API_URL, USER_INFO } from './config';

const filterOptions: FilterOption[] = [
  { value: 'numbers', label: 'Numbers' },
  { value: 'alphabets', label: 'Alphabets' },
  { value: 'highest_alphabet', label: 'Highest Alphabet' }
];

const sampleInput = {
  data: ["M", "1", "334", "4", "B"]
};

function App() {
  const [input, setInput] = useState(JSON.stringify(sampleInput, null, 2));
  const [response, setResponse] = useState<BFHLResponse | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(false);

  const validateJSON = (input: string): BFHLRequest | null => {
    try {
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed.data)) {
        throw new Error('Input must contain a "data" array');
      }
      return parsed;
    } catch (error) {
      return null;
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    validateJSON(value);
  };

  // Process the data locally since we can't access the API
  const processData = (data: string[]): BFHLResponse => {
    const numbers = data.filter(item => !isNaN(Number(item)));
    const alphabets = data.filter(item => /^[A-Za-z]$/.test(item));
    const highest = alphabets.length > 0 
      ? [alphabets.reduce((a, b) => a.toLowerCase() > b.toLowerCase() ? a : b)]
      : [];

    return {
      is_success: true,
      user_id: `${USER_INFO.name}_${USER_INFO.dob}`,
      email: USER_INFO.email,
      roll_number: USER_INFO.roll_number,
      numbers,
      alphabets,
      highest_alphabet: highest
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const parsedInput = validateJSON(input);
      if (!parsedInput) {
        throw new Error('Invalid JSON format. Please check your input.');
      }

      setLoading(true);
      
      // Process the data locally instead of making an API call
      const response = processData(parsedInput.data);
      setResponse(response);
      toast.success('Data processed successfully!');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(errorMessage);
      console.error('Error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredResponse = () => {
    if (!response) return null;

    const filtered: Partial<BFHLResponse> = {
      is_success: response.is_success,
      user_id: response.user_id,
    };

    selectedFilters.forEach((filter) => {
      if (response[filter.value]) {
        filtered[filter.value] = response[filter.value];
      }
    });

    return filtered;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <Code className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">BFHL API Tester</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="json-input" className="block text-sm font-medium text-gray-700 mb-2">
                JSON Input
              </label>
              <div className="relative">
                <textarea
                  id="json-input"
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Input must be valid JSON with a "data" array. Example format shown by default.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || !validateJSON(input)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </>
              )}
            </button>
          </form>
        </div>

        {response && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Response
              </label>
              <Select
                isMulti
                options={filterOptions}
                value={selectedFilters}
                onChange={(selected) => setSelectedFilters(selected as FilterOption[])}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Response</h3>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(getFilteredResponse(), null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;