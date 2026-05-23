import React from 'react';
import { View, Text } from 'react-native';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-white px-6">
          <Text className="text-xl font-heading font-bold text-gray-900 mb-2">
            Something went wrong
          </Text>
          <Text className="text-sm font-body text-gray-500 text-center">
            The app encountered an error. Please restart the app.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}
