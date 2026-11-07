/**
 * ChalMeter India (चाल + मीटर) — Aapki Chal. Aapka Score.
 * Mobile-first Progressive Web Application for Android and iPhone
 */

import React, { useState } from 'react';
import { Vehicle, VehicleType, PlateType } from './types';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';
import { OfflineIndicator } from './components/OfflineIndicator';

import { HomeView } from './views/HomeView';
import { ScanView } from './views/ScanView';
import { RateView } from './views/RateView';
import { VehicleDetailView } from './views/VehicleDetailView';
import { SearchView } from './views/SearchView';
import { LeaderboardView } from './views/LeaderboardView';
import { ProfileView } from './views/ProfileView';
import { Footer } from './components/Footer';

export default function App() {
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Vehicle data staged from Scan to Rate
  const [stagedVehicleData, setStagedVehicleData] = useState<{
    registrationNumber: string;
    make: string;
    model: string;
    colour: string;
    vehicleType: VehicleType;
    plateType: PlateType;
  } | null>(null);

  // Auth modal
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | undefined>(undefined);

  const handleOpenAuth = (msg?: string) => {
    setAuthMessage(msg);
    setIsAuthOpen(true);
  };

  // Navigations
  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setActiveView('vehicle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScanClick = () => {
    setActiveView('scan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchClick = () => {
    setActiveView('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // From ScanView -> User confirmed vehicle information
  const handleConfirmVehicleFromScan = (data: {
    registrationNumber: string;
    make: string;
    model: string;
    colour: string;
    vehicleType: VehicleType;
    plateType: PlateType;
  }) => {
    setStagedVehicleData(data);
    setActiveView('rate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // From VehicleDetailView -> User clicked "Rate This Vehicle"
  const handleRateExistingVehicle = (vehicle: Vehicle) => {
    setStagedVehicleData({
      registrationNumber: vehicle.registrationNumber,
      make: vehicle.make,
      model: vehicle.model,
      colour: vehicle.colour,
      vehicleType: vehicle.vehicleType,
      plateType: vehicle.plateType,
    });
    setActiveView('rate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // From RateView -> Review submitted successfully
  const handleRateSuccess = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setStagedVehicleData(null);
    setActiveView('vehicle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-slate-100 flex flex-col font-sans selection:bg-[#A3E635] selection:text-black">
      {/* Offline connectivity banner */}
      <OfflineIndicator />

      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => handleOpenAuth('Sign in to view full community logs & submit ratings.')}
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-4 sm:py-6">
        {activeView === 'home' && (
          <HomeView
            onSelectVehicle={handleSelectVehicle}
            onScanClick={handleScanClick}
            onSearchClick={handleSearchClick}
          />
        )}

        {activeView === 'scan' && (
          <ScanView
            onConfirmVehicle={handleConfirmVehicleFromScan}
            onViewExistingVehicle={handleSelectVehicle}
            onCancel={() => setActiveView('home')}
          />
        )}

        {activeView === 'rate' && stagedVehicleData && (
          <RateView
            vehicleData={stagedVehicleData}
            onSuccess={handleRateSuccess}
            onCancel={() => setActiveView(selectedVehicleId ? 'vehicle' : 'home')}
            onOpenAuth={() => handleOpenAuth('Please sign in before submitting your rating.')}
          />
        )}

        {activeView === 'vehicle' && selectedVehicleId && (
          <VehicleDetailView
            vehicleId={selectedVehicleId}
            onBack={() => setActiveView('home')}
            onRateVehicle={handleRateExistingVehicle}
            onOpenAuth={() => handleOpenAuth('Sign in with Google or Email to unlock detailed witness reports.')}
          />
        )}

        {activeView === 'search' && (
          <SearchView
            onSelectVehicle={handleSelectVehicle}
            onScanClick={handleScanClick}
          />
        )}

        {activeView === 'leaderboard' && (
          <LeaderboardView onSelectVehicle={handleSelectVehicle} />
        )}

        {activeView === 'profile' && (
          <ProfileView
            onOpenAuth={() => handleOpenAuth()}
            onSelectVehicle={handleSelectVehicle}
          />
        )}
      </main>

      {/* Official ChalMeter Contact Footer */}
      {activeView !== 'scan' && activeView !== 'rate' && <Footer />}

      {/* Mobile-first Bottom Navigation Bar */}
      <BottomNav
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        message={authMessage}
      />
    </div>
  );
}
