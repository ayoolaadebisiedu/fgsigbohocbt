import React from 'react';
import { Award, Calendar, User, BookOpen, Clock, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Helper Components ---

// Stylish Header
const ReportHeader = ({ schoolName, schoolLogoUrl, examTitle }: { schoolName: string, schoolLogoUrl: string, examTitle: string }) => (
    <div className="relative mb-8 text-center border-b-2 border-primary/20 pb-6 print:border-black">
        <div className="absolute left-0 top-0">
            <img
                src={schoolLogoUrl}
                alt="School Logo"
                className="w-24 h-24 object-contain drop-shadow-md print:filter-none print:drop-shadow-none"
                onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = "/logo.png"; }}
            />
        </div>
        <div className="px-20">
            <h1 className="text-3xl font-extrabold text-primary uppercase tracking-tight mb-2 print:text-black">{schoolName}</h1>
            <h2 className="text-xl font-semibold text-muted-foreground uppercase tracking-widest print:text-gray-600">Official Report Card</h2>
            <div className="mt-4 inline-block px-6 py-2 bg-primary/5 rounded-full border border-primary/10 print:border-black print:bg-transparent">
                <span className="text-lg font-medium text-primary print:text-black">{examTitle}</span>
            </div>
        </div>
    </div>
);

// Student Profile Card
const StudentProfile = ({ candidate }: { candidate: any }) => (
    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm mb-8 print:shadow-none print:border print:border-black print:bg-transparent">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
                <div className="flex items-center text-muted-foreground text-xs uppercase tracking-wide font-semibold mb-1">
                    <User className="w-3 h-3 mr-1" /> Student Name
                </div>
                <div className="font-bold text-lg text-slate-900">{candidate.name}</div>
            </div>
            <div className="space-y-1">
                <div className="flex items-center text-muted-foreground text-xs uppercase tracking-wide font-semibold mb-1">
                    <BookOpen className="w-3 h-3 mr-1" /> Student ID
                </div>
                <div className="font-mono text-lg text-slate-900">{candidate.studentId}</div>
            </div>
            <div className="space-y-1">
                <div className="flex items-center text-muted-foreground text-xs uppercase tracking-wide font-semibold mb-1">
                    <Award className="w-3 h-3 mr-1" /> Class Level
                </div>
                <div className="font-medium text-lg text-slate-900">{candidate.gradeLevel}</div>
            </div>
            <div className="space-y-1">
                <div className="flex items-center text-muted-foreground text-xs uppercase tracking-wide font-semibold mb-1">
                    <Calendar className="w-3 h-3 mr-1" /> Date
                </div>
                <div className="font-medium text-lg text-slate-900">{candidate.date}</div>
            </div>
        </div>
    </div>
);

// Score Hero Section
const ScoreHero = ({ overallResult }: { overallResult: any }) => {
    const isPass = overallResult.status === 'PASS';
    return (
        <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className={`flex-1 rounded-xl p-6 border-2 flex items-center justify-between ${isPass ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} print:bg-transparent print:border-black`}>
                <div>
                    <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Score</div>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-extrabold ${isPass ? 'text-green-700' : 'text-red-700'} print:text-black`}>{overallResult.score}</span>
                        <span className="text-muted-foreground font-medium">/ {overallResult.total}</span>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold text-xl border ${isPass ? 'bg-white text-green-700 border-green-200' : 'bg-white text-red-700 border-red-200'} print:border-black print:text-black`}>
                    {overallResult.status}
                </div>
            </div>

            <div className="flex-1 rounded-xl p-6 border border-slate-200 bg-white shadow-sm flex items-center justify-between print:shadow-none print:border-black">
                <div>
                    <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Overall Percentage</div>
                    <div className="text-4xl font-extrabold text-primary print:text-black">{overallResult.percentage.toFixed(1)}%</div>
                </div>
                <div className="h-16 w-16 rounded-full border-4 border-slate-100 flex items-center justify-center print:border-gray-300">
                    <span className="text-xl font-bold text-slate-400 print:text-black">%</span>
                </div>
            </div>
        </div>
    );
};

// Refined Table
const SubjectTable = ({ breakdown }: { breakdown: any[] }) => (
    <div className="mb-8 rounded-xl border border-slate-200 overflow-hidden print:border-black">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 font-semibold text-slate-700 flex justify-between items-center print:bg-gray-100 print:border-black">
            <span>Subject Performance</span>
            <span className="text-xs font-normal text-muted-foreground uppercase tracking-wide print:text-black">Detailed Breakdown</span>
        </div>
        <table className="w-full text-sm text-left">
            <thead className="bg-white text-muted-foreground font-medium border-b border-slate-100 print:border-black">
                <tr>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3 text-center">Questions</th>
                    <th className="px-6 py-3 text-center">Correct</th>
                    <th className="px-6 py-3 text-right">Performance</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-black">
                {breakdown.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-medium text-slate-900">{item.subject}</td>
                        <td className="px-6 py-4 text-center text-slate-600">{item.questions}</td>
                        <td className="px-6 py-4 text-center font-semibold text-green-600 print:text-black">{item.correct}</td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                                <span className="font-bold text-slate-700">{item.percentage.toFixed(0)}%</span>
                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden print:hidden">
                                    <div
                                        className={`h-full rounded-full ${item.percentage >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// Footer
const ReportFooter = () => (
    <div className="mt-12 pt-8 border-t border-slate-200 print:border-black">
        <div className="grid grid-cols-2 gap-12 mb-8">
            <div className="text-center">
                <div className="h-16 border-b border-slate-300 w-3/4 mx-auto mb-2 print:border-black"></div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Principal's Signature</p>
            </div>
            <div className="text-center">
                <div className="h-16 border-b border-slate-300 w-3/4 mx-auto mb-2 print:border-black"></div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Date</p>
            </div>
        </div>
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest">
            Generated by Faith Immaculate Academy CBT System • Valid without seal if accessed online
        </p>
    </div>
);

// Main Component
export const ResultTemplate = ({ data, onPrint, showPrintButton = true }: { data: any, onPrint?: () => void, showPrintButton?: boolean }) => {
    return (
        <div className="min-h-screen bg-slate-100 p-8 print:p-0 print:bg-white relative">
            {/* Floating Print Button - Hidden in Print */}
            {showPrintButton && (
                <div className="fixed top-6 right-6 z-50 print:hidden no-print">
                    <Button
                        onClick={onPrint || (() => window.print())}
                        className="shadow-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 transition-all hover:scale-105 flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" /> Print Report
                    </Button>
                </div>
            )}

            <div className="max-w-[8.5in] mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none print:max-w-none">
                <div className="p-12 print:p-4">
                    <ReportHeader
                        schoolName={data.schoolName}
                        schoolLogoUrl={data.schoolLogoUrl}
                        examTitle={data.examTitle}
                    />

                    <StudentProfile candidate={data.candidate} />

                    <ScoreHero overallResult={data.overallResult} />

                    <SubjectTable breakdown={data.subjectBreakdown} />

                    <ReportFooter />
                </div>
            </div>

            {/* Print Styles Injection */}
            <style>
                {`
                @media print {
                    @page { margin: 0.5in; size: auto; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                }
                `}
            </style>
        </div>
    );
};
