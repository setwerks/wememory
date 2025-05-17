declare module 'react-places-autocomplete' {
  import * as React from 'react';
  export interface Suggestion {
    description: string;
    placeId: string;
    active: boolean;
    formattedSuggestion: { mainText: string; secondaryText: string };
    index: number;
    matchedSubstrings: { length: number; offset: number }[];
    terms: { offset: number; value: string }[];
    types: string[];
  }
  export interface PlacesAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (address: string) => void;
    children: (props: {
      getInputProps: (options?: any) => any;
      suggestions: Suggestion[];
      getSuggestionItemProps: (suggestion: Suggestion, options?: any) => any;
      loading: boolean;
    }) => React.ReactNode;
    searchOptions?: object;
    debounce?: number;
    highlightFirstSuggestion?: boolean;
  }
  const PlacesAutocomplete: React.FC<PlacesAutocompleteProps>;
  export default PlacesAutocomplete;
  export function geocodeByAddress(address: string): Promise<any[]>;
  export function getLatLng(result: any): Promise<{ lat: number; lng: number }>;
} 