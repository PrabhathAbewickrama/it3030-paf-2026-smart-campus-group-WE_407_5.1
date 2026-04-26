import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { getTickets, getTechnicians } from '../services/api';

const STORAGE_KEY = 'nexus-ops-settings';

const DEFAULT_SETTINGS = {
    escalationHours: '4',
    maxOpenTicketsPerTechnician: '6',
    autoCloseDays: '2',
    evidenceRequiredForHighPriority: true,
    enableRequesterComments: true,
    notifyManagersOnReject: true
};

export const Settings = () => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [savedAt, setSavedAt] = useState('');
    const [tickets, setTickets] = useState([]);
    const [technicians, setTechnicians] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
            } catch (error) {
                console.error('Invalid local settings payload', error);
            }
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ticketRes, technicianRes] = await Promise.all([getTickets(), getTechnicians()]);
                setTickets(ticketRes.data);
                setTechnicians(technicianRes.data);
            } catch (error) {
                console.error('Failed to load settings metrics', error);
            }
        };

        fetchData();
    }, []);

    const activeTickets = useMemo(
        () => tickets.filter((ticket) => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS').length,
        [tickets]
    );

    const capacityLimit = Number(settings.maxOpenTicketsPerTechnician || 0) * technicians.length;
    const capacityState = capacityLimit === 0 ? 0 : Math.min((activeTickets / capacityLimit) * 100, 100);

    const updateField = (key, value) => {
        setSettings((current) => ({ ...current, [key]: value }));
    };

    const saveSettings = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        setSavedAt(new Date().toLocaleString());
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Operations Settings</h1>
                    <p className="text-sm text-gray-400">Configure the incident workflow rules used by your Member 4 module.</p>
                </div>
                <Badge variant="default" className="w-fit">
                    {savedAt ? `Saved locally at ${savedAt}` : 'Local draft settings'}
                </Badge>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.9fr)]">
                <Card className="space-y-6 border border-gray-800/80">
                    <section className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Ticket Handling Rules</h2>
                            <p className="text-sm text-gray-500">These values give your team a clear operational baseline for support flow.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <SettingField
                                label="Escalation threshold (hours)"
                                value={settings.escalationHours}
                                onChange={(value) => updateField('escalationHours', value)}
                            />
                            <SettingField
                                label="Max open tickets per technician"
                                value={settings.maxOpenTicketsPerTechnician}
                                onChange={(value) => updateField('maxOpenTicketsPerTechnician', value)}
                            />
                            <SettingField
                                label="Auto-close after resolution (days)"
                                value={settings.autoCloseDays}
                                onChange={(value) => updateField('autoCloseDays', value)}
                            />
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Workflow Toggles</h2>
                            <p className="text-sm text-gray-500">Use these switches to document the expected module behavior for the demo.</p>
                        </div>

                        <ToggleRow
                            title="Require evidence for high-priority tickets"
                            description="Encourages photo uploads before urgent issues move forward."
                            checked={settings.evidenceRequiredForHighPriority}
                            onChange={(checked) => updateField('evidenceRequiredForHighPriority', checked)}
                        />
                        <ToggleRow
                            title="Allow requester comments"
                            description="Keeps two-way communication open during troubleshooting."
                            checked={settings.enableRequesterComments}
                            onChange={(checked) => updateField('enableRequesterComments', checked)}
                        />
                        <ToggleRow
                            title="Notify managers when tickets are rejected"
                            description="Makes rejected campus issues visible for follow-up review."
                            checked={settings.notifyManagersOnReject}
                            onChange={(checked) => updateField('notifyManagersOnReject', checked)}
                        />
                    </section>

                    <div className="flex flex-wrap gap-3">
                        <Button onClick={saveSettings}>Save Settings</Button>
                        <Button variant="outline" onClick={() => setSettings(DEFAULT_SETTINGS)}>
                            Reset to Defaults
                        </Button>
                    </div>
                </Card>

                <Card className="space-y-5 border border-gray-800/80">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Live Capacity Snapshot</h2>
                        <p className="text-sm text-gray-500">A quick operational summary based on current ticket data.</p>
                    </div>

                    <MetricBlock label="Active Tickets" value={activeTickets} />
                    <MetricBlock label="Available Technicians" value={technicians.length} />
                    <MetricBlock label="Configured Capacity" value={capacityLimit || 0} />

                    <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-gray-400">Technician load</span>
                            <span className="font-medium text-white">{capacityState.toFixed(0)}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-500 transition-all"
                                style={{ width: `${capacityState}%` }}
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-4 text-sm text-gray-300">
                        <p className="font-medium text-white">Recommended demo script</p>
                        <p className="mt-2">
                            Create a ticket, assign a technician, move it through resolution, then show how these settings describe the workflow policy behind the module.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const SettingField = ({ label, value, onChange }) => (
    <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">{label}</label>
        <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
);

const ToggleRow = ({ title, description, checked, onChange }) => (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-gray-800 bg-gray-900/40 p-4">
        <div>
            <p className="font-medium text-white">{title}</p>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-7 w-14 shrink-0 rounded-full border transition-colors ${checked ? 'border-primary bg-primary/80' : 'border-gray-700 bg-gray-800'}`}
        >
            <span
                className={`absolute top-0.5 h-5.5 w-5.5 rounded-full bg-white transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`}
            />
        </button>
    </div>
);

const MetricBlock = ({ label, value }) => (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-4">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="mt-1 text-3xl font-bold text-white">{value}</p>
    </div>
);
