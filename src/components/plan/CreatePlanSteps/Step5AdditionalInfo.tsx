'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, X, Globe, Search, ChevronDown } from 'lucide-react';

interface Step5AdditionalInfoProps {
  data: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  isValid: boolean;
}

const defaultLanguages = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati',
  'Urdu', 'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese', 'French',
  'Spanish', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese'
];

export default function Step5AdditionalInfo({ data, onSubmit, isLoading, isValid }: Step5AdditionalInfoProps) {
  const [formData, setFormData] = useState({
    highlights: data.highlights || [],
    inclusions: data.inclusions || [],
    exclusions: data.exclusions || [],
    requirements: data.requirements || [],
    languages: data.languages || []
  });

  const [newHighlight, setNewHighlight] = useState('');
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  
  // Language dropdown state
  const [languageSearch, setLanguageSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState(defaultLanguages);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    setFormData({
      highlights: data.highlights || [],
      inclusions: data.inclusions || [],
      exclusions: data.exclusions || [],
      requirements: data.requirements || [],
      languages: data.languages || []
    });

    // Update available languages to include any custom languages already selected
    if (data.languages && Array.isArray(data.languages)) {
      const customLangs = data.languages.filter((lang: string) => !defaultLanguages.includes(lang));
      if (customLangs.length > 0) {
        setAvailableLanguages([...defaultLanguages, ...customLangs]);
      }
    }
    isInitialMount.current = true; // Reset on data change from parent
  }, [data]);

  // Sync formData to parent on change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onSubmit(formData);
  }, [formData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setLanguageSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addToList = (listName: string, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      handleInputChange(listName, [...(formData[listName as keyof typeof formData] as string[]), value.trim()]);
      setter('');
    }
  };

  const removeFromList = (listName: string, index: number) => {
    handleInputChange(listName, (formData[listName as keyof typeof formData] as string[]).filter((_: any, i: number) => i !== index));
  };

  const addLanguage = (lang: string) => {
    const trimmedLang = lang.trim();
    if (trimmedLang && !formData.languages.includes(trimmedLang)) {
      // Add to available languages if not already there
      if (!availableLanguages.includes(trimmedLang)) {
        setAvailableLanguages([...availableLanguages, trimmedLang]);
      }
      handleInputChange('languages', [...formData.languages, trimmedLang]);
      setLanguageSearch('');
      setIsDropdownOpen(false);
    }
  };

  const removeLanguage = (lang: string) => {
    handleInputChange('languages', formData.languages.filter((l: string) => l !== lang));
  };

  const filteredLanguages = availableLanguages.filter(lang => 
    !formData.languages.includes(lang) &&
    lang.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const searchTermExists = languageSearch.trim() && 
    !availableLanguages.some(lang => lang.toLowerCase() === languageSearch.toLowerCase().trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Information</h2>
        <p className="text-gray-600">Add highlights, inclusions, exclusions, and more (All optional)</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Highlights */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tour Highlights
          </label>
          <div className="space-y-2">
            {formData.highlights.map((highlight: string, index: number) => (
              <div key={index} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-md shadow-sm hover:shadow-md transition-shadow">
                <span className="text-sm text-gray-900">{highlight}</span>
                <button
                  type="button"
                  onClick={() => removeFromList('highlights', index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                placeholder="Add a highlight..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              />
              <button
                type="button"
                onClick={() => addToList('highlights', newHighlight, setNewHighlight)}
                className="px-3 py-2 bg-teal-600 text-white rounded-r-md hover:bg-teal-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-1" />
            Languages Offered
          </label>
          
          {/* Selected Languages List */}
          {formData.languages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.languages.map((lang: string) => (
                <div
                  key={lang}
                  className="flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm"
                >
                  <span>{lang}</span>
                  <button
                    type="button"
                    onClick={() => removeLanguage(lang)}
                    className="text-teal-700 hover:text-teal-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Language Search Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={languageSearch}
                onChange={(e) => {
                  setLanguageSearch(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search and select languages..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              />
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
              >
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredLanguages.length > 0 ? (
                  <div className="py-1">
                    {filteredLanguages.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => addLanguage(lang)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-900 focus:bg-teal-50 focus:outline-none"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                ) : searchTermExists ? (
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => addLanguage(languageSearch.trim())}
                      className="w-full text-left px-4 py-2 text-sm text-teal-600 hover:bg-teal-50 focus:bg-teal-50 focus:outline-none flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add '{languageSearch.trim()}'
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    {languageSearch ? 'No languages found' : 'Start typing to search languages'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Inclusions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's Included
          </label>
          <div className="space-y-2">
            {formData.inclusions.map((inclusion: string, index: number) => (
              <div key={index} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-md shadow-sm hover:shadow-md transition-shadow">
                <span className="text-sm text-gray-900">{inclusion}</span>
                <button
                  type="button"
                  onClick={() => removeFromList('inclusions', index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex">
              <input
                type="text"
                value={newInclusion}
                onChange={(e) => setNewInclusion(e.target.value)}
                placeholder="Add an inclusion..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              />
              <button
                type="button"
                onClick={() => addToList('inclusions', newInclusion, setNewInclusion)}
                className="px-3 py-2 bg-teal-600 text-white rounded-r-md hover:bg-teal-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Exclusions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's Not Included
          </label>
          <div className="space-y-2">
            {formData.exclusions.map((exclusion: string, index: number) => (
              <div key={index} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-md shadow-sm hover:shadow-md transition-shadow">
                <span className="text-sm text-gray-900">{exclusion}</span>
                <button
                  type="button"
                  onClick={() => removeFromList('exclusions', index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex">
              <input
                type="text"
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
                placeholder="Add an exclusion..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              />
              <button
                type="button"
                onClick={() => addToList('exclusions', newExclusion, setNewExclusion)}
                className="px-3 py-2 bg-teal-600 text-white rounded-r-md hover:bg-teal-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requirements
          </label>
          <div className="space-y-2">
            {formData.requirements.map((requirement: string, index: number) => (
              <div key={index} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-md shadow-sm hover:shadow-md transition-shadow">
                <span className="text-sm text-gray-900">{requirement}</span>
                <button
                  type="button"
                  onClick={() => removeFromList('requirements', index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Add a requirement..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              />
              <button
                type="button"
                onClick={() => addToList('requirements', newRequirement, setNewRequirement)}
                className="px-3 py-2 bg-teal-600 text-white rounded-r-md hover:bg-teal-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
