import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, CheckCircle, XCircle, Printer } from "lucide-react";
import type { Result, Exam } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ResultTemplate } from "@/components/ResultTemplate";
import { createRoot } from "react-dom/client";

export default function AdminResults() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: results, isLoading: resultsLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
  });

  const { data: exams } = useQuery<Exam[]>({
    queryKey: ["/api/exams"],
  });

  const { data: questions } = useQuery<any[]>({ queryKey: ["/api/questions"] });
  const { data: students } = useQuery<any[]>({ queryKey: ["/api/students"] });

  const [filterExamId, setFilterExamId] = useState<string>("ALL");

  const filteredResults = results?.filter(
    (result) =>
      (filterExamId === "ALL" || result.examId === filterExamId) &&
      (result.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getExamTitle = (examId: string) => {
    return exams?.find((e) => e.id === examId)?.title || "Unknown Exam";
  };

  const handlePrint = (result: Result) => {
    const exam = exams?.find(e => e.id === result.examId);
    const student = students?.find(s => s.studentId === result.studentId);

    // Calculate breakdown
    const breakdown: any[] = [];
    if (questions && exam) {
      const examQuestions = questions.filter(q => exam.questionIds.includes(q.id));
      const subjects = Array.from(new Set(examQuestions.map(q => q.subject)));

      subjects.forEach(subject => {
        const subjectQuestions = examQuestions.filter(q => q.subject === subject);
        const totalQuestions = subjectQuestions.length;
        let correctCount = 0;

        subjectQuestions.forEach(q => {
          if (result.correctAnswers && result.correctAnswers[q.id]) {
            correctCount++;
          }
        });

        breakdown.push({
          subject,
          questions: totalQuestions,
          correct: correctCount,
          percentage: totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0
        });
      });
    }

    const printData = {
      schoolName: "Faith Immaculate Academy",
      schoolLogoUrl: "/logo.png",
      examTitle: exam?.title || "Exam Result",
      candidate: {
        name: result.studentName,
        studentId: result.studentId,
        gradeLevel: student?.classLevel || "-",
        date: new Date(result.completedAt).toLocaleDateString(),
      },
      overallResult: {
        score: result.score,
        total: result.totalPoints,
        percentage: result.percentage,
        timeTakenMinutes: 60, // Mocking time taken
        status: result.passed ? 'PASS' : 'FAIL',
      },
      subjectBreakdown: breakdown
    };

    // Create a hidden iframe or new window to print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Result</title>');
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      styles.forEach(style => {
        printWindow.document.head.appendChild(style.cloneNode(true));
      });
      printWindow.document.write('<script src="https://cdn.tailwindcss.com"><\\/script>');
      printWindow.document.write('</head><body><div id="print-root"></div></body></html>');

      printWindow.document.close();

      // Wait for resources to load then render
      printWindow.onload = () => {
        let attempts = 0;
        const interval = setInterval(() => {
          const container = printWindow.document.getElementById('print-root');
          if (container) {
            clearInterval(interval);
            const root = createRoot(container);
            // @ts-ignore
            root.render(<ResultTemplate data={printData} onPrint={() => printWindow.print()} />);
          } else if (attempts >= 10) {
            clearInterval(interval);
            console.error("Print root element not found after polling.");
            toast({ title: "Print Error", description: "Could not prepare print document.", variant: "destructive" });
          }
          attempts++;
        }, 100);
      };
    } else {
      toast({ title: "Error", description: "Pop-up blocked. Please allow pop-ups for this site.", variant: "destructive" });
    }
  };

  const handlePrintBroadsheet = () => {
    if (filterExamId === "ALL" || !filteredResults || filteredResults.length === 0) {
      toast({ title: "Action Required", description: "Please select a specific exam to print a score sheet.", variant: "destructive" });
      return;
    }

    const exam = exams?.find(e => e.id === filterExamId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: "Error", description: "Pop-up blocked. Please allow pop-ups for this site.", variant: "destructive" });
      return;
    }

    printWindow.document.write('<html><head><title>Score Sheet</title>');
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach(style => {
      printWindow.document.head.appendChild(style.cloneNode(true));
    });
    printWindow.document.write('<script src="https://cdn.tailwindcss.com"><\\/script>');
    printWindow.document.write(`
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #0f172a; padding: 20px; }
          .print-btn { 
             position: fixed; 
             top: 20px; 
             right: 20px; 
             background: #2563eb; 
             color: white; 
             padding: 10px 20px; 
             border-radius: 9999px; 
             font-weight: 600; 
             box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); 
             cursor: pointer; 
             border: none;
             z-index: 50;
             transition: all 0.2s;
             display: flex;
             align-items: center;
             gap: 8px;
          }
          .print-btn:hover { background: #1d4ed8; transform: translateY(-2px); }
          .sheet-container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
          
          table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 20px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
          th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background-color: #f1f5f9; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
          tr:last-child td { border-bottom: none; }
          tr:hover td { background-color: #f8fafc; }
          
          .header { text-align: center; margin-bottom: 40px; position: relative; border-bottom: 2px solid #e2e8f0; padding-bottom: 30px; }
          .logo { width: 80px; height: 80px; object-fit: contain; margin-bottom: 10px; }
          .school-title { font-size: 24px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: -0.02em; }
          .doc-title { font-size: 16px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-top: 5px; letter-spacing: 0.1em; }
          
          .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; text-align: center; }
          .meta-item { background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .meta-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 4px; }
          .meta-value { font-size: 14px; font-weight: 700; color: #0f172a; }

          .badge { padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; display: inline-block; }
          .pass { background-color: #dcfce7; color: #166534; }
          .fail { background-color: #fee2e2; color: #991b1b; }

          @media print {
            body { background: white; padding: 0; }
            .print-btn { display: none; }
            .sheet-container { box-shadow: none; padding: 20px; max-width: 100%; border-radius: 0; }
            table { border: 1px solid #000; }
            th { background-color: #eee !important; color: #000; border-bottom: 1px solid #000; }
            td { border-bottom: 1px solid #000; }
            .meta-item { border: 1px solid #000; }
          }
        </style>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
      `);
    printWindow.document.write('</head><body>');

    printWindow.document.write(`
        <button class="print-btn" onclick="window.print()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Print Sheet
        </button>

        <div class="sheet-container">
          <div class="header">
            <img src="/logo.png" alt="Logo" class="logo" />
            <h1 class="school-title">Faith Immaculate Academy</h1>
            <h2 class="doc-title">Official Score Sheet</h2>
            
            <div class="meta-grid">
               <div class="meta-item">
                 <div class="meta-label">Examination</div>
                 <div class="meta-value">${exam?.title || "N/A"}</div>
               </div>
               <div class="meta-item">
                 <div class="meta-label">Date Generated</div>
                 <div class="meta-value">${new Date().toLocaleDateString()}</div>
               </div>
               <div class="meta-item">
                 <div class="meta-label">Candidates</div>
                 <div class="meta-value">${filteredResults.length}</div>
               </div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 50px">S/N</th>
                <th>Student Name</th>
                <th>Student ID</th>
                <th>Score</th>
                <th>Total</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
      `);

    // Sort by Name
    const sorted = [...filteredResults].sort((a, b) => a.studentName.localeCompare(b.studentName));

    sorted.forEach((r, idx) => {
      printWindow.document.write(`
            <tr>
              <td>${idx + 1}</td>
              <td style="font-weight: 600;">${r.studentName}</td>
              <td style="font-family: monospace;">${r.studentId}</td>
              <td>${r.score}</td>
              <td>${r.totalPoints}</td>
              <td>${r.percentage}%</td>
              <td><span class="badge ${r.passed ? 'pass' : 'fail'}">${r.passed ? 'PASS' : 'FAIL'}</span></td>
            </tr>
          `);
    });

    printWindow.document.write(`
          </tbody>
        </table>
        
        <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; color: #666; padding-top: 10px; border-top: 1px solid #eee;">
           <div>Authorized Principal Signature: _______________________</div>
           <div>${new Date().toLocaleString()}</div>
        </div>
        </div>
      `);

    printWindow.document.write('</body></html>');
    printWindow.document.close();
  };

  const [selectedResultIds, setSelectedResultIds] = useState<Set<string>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked && filteredResults) {
      setSelectedResultIds(new Set(filteredResults.map(r => r.id)));
    } else {
      setSelectedResultIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const next = new Set(selectedResultIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedResultIds(next);
  };

  const handleBulkPrint = () => {
    const selected = results?.filter(r => selectedResultIds.has(r.id));
    if (!selected || selected.length === 0) {
      toast({ title: "Warning", description: "No results selected for bulk print.", variant: "default" });
      return;
    }

    // Generate data for each result
    const printPayloads = selected.map(result => {
      const exam = exams?.find(e => e.id === result.examId);
      const student = students?.find(s => s.studentId === result.studentId);

      // Calculate breakdown (reuse logic effectively or simplify for now)
      const breakdown: any[] = [];
      if (questions && exam) {
        const examQuestions = questions.filter(q => exam.questionIds.includes(q.id));
        const subjects = Array.from(new Set(examQuestions.map(q => q.subject)));
        subjects.forEach(subject => {
          const subjectQuestions = examQuestions.filter(q => q.subject === subject);
          let correctCount = 0;
          subjectQuestions.forEach(q => {
            if (result.correctAnswers && result.correctAnswers[q.id]) correctCount++;
          });
          breakdown.push({
            subject,
            questions: subjectQuestions.length,
            correct: correctCount,
            percentage: subjectQuestions.length > 0 ? (correctCount / subjectQuestions.length) * 100 : 0
          });
        });
      }

      return {
        schoolName: "Faith Immaculate Academy",
        schoolLogoUrl: "/logo.png",
        examTitle: exam?.title || "Exam Result",
        candidate: {
          name: result.studentName,
          studentId: result.studentId,
          gradeLevel: student?.classLevel || "-",
          date: new Date(result.completedAt).toLocaleDateString(),
        },
        overallResult: {
          score: result.score,
          total: result.totalPoints,
          percentage: result.percentage,
          timeTakenMinutes: 60,
          status: result.passed ? 'PASS' : 'FAIL',
        },
        subjectBreakdown: breakdown
      };
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Report Cards</title>');
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      styles.forEach(style => {
        printWindow.document.head.appendChild(style.cloneNode(true));
      });
      printWindow.document.write('<script src="https://cdn.tailwindcss.com"><\\/script>');
      printWindow.document.write(`
        <style>
           body { background-color: #f1f5f9; }
           @media print { 
             body { background-color: white; } 
             .page-break { page-break-after: always; }
           }
           #print-root { display: flex; flex-direction: column; gap: 2rem; align-items: center; padding: 2rem; }
           .report-wrapper { width: 100%; max-width: 8.5in; }
        </style>
      `);
      printWindow.document.write('</head><body><div id="print-root"></div></body></html>');

      printWindow.document.close();

      printWindow.onload = () => {
        let attempts = 0;
        const interval = setInterval(() => {
          const container = printWindow.document.getElementById('print-root');
          if (container) {
            clearInterval(interval);
            const root = createRoot(container);
            root.render(
              <>
                {/* Shared Print Button */}
                <div className="fixed top-6 right-6 z-50 print:hidden">
                  <Button
                    onClick={() => printWindow.print()}
                    className="shadow-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Print All ({printPayloads.length})
                  </Button>
                </div>

                {printPayloads.map((data, idx) => (
                  <div key={idx} className="report-wrapper page-break">
                    <ResultTemplate data={data} showPrintButton={false} />
                  </div>
                ))}
              </>
            );
          } else if (attempts >= 10) {
            clearInterval(interval);
            console.error("Print root element not found after polling.");
            toast({ title: "Print Error", description: "Could not prepare print document.", variant: "destructive" });
          }
          attempts++;
        }, 100);
      };
    } else {
      toast({ title: "Error", description: "Pop-up blocked. Please allow pop-ups for this site.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Results</h1>
        <p className="text-muted-foreground">
          View and analyze student exam results
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by student name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-results"
            />
            {searchQuery && (
              <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => setSearchQuery("")} title="Clear Search">
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filter */}
          <div className="w-[200px]">
            <Select value={filterExamId} onValueChange={setFilterExamId}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Exam" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Exams</SelectItem>
                {exams?.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center gap-2">
          {selectedResultIds.size > 0 && (
            <Button onClick={handleBulkPrint} data-testid="button-bulk-print">
              <Printer className="mr-2 h-4 w-4" />
              Print Cards ({selectedResultIds.size})
            </Button>
          )}

          {filterExamId !== "ALL" && (
            <Button variant="outline" onClick={handlePrintBroadsheet} title="Print Score Sheet for this Exam">
              <Printer className="mr-2 h-4 w-4" />
              Print Score Sheet
            </Button>
          )}
        </div>
      </div>

      {resultsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filteredResults && filteredResults.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={filteredResults.length > 0 && Array.from(selectedResultIds).length === filteredResults.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults
                .sort(
                  (a, b) =>
                    new Date(b.completedAt).getTime() -
                    new Date(a.completedAt).getTime()
                )
                .map((result) => (
                  <TableRow key={result.id} data-testid={`row-result-${result.id}`} className={selectedResultIds.has(result.id) ? "bg-muted/50" : ""}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedResultIds.has(result.id)}
                        onChange={(e) => handleSelectOne(result.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <div
                        className="cursor-pointer hover:underline"
                        onClick={() => setSearchQuery(result.studentId)}
                        title="Click to view all results for this student"
                      >
                        <p className="font-medium text-primary">{result.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.studentId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getExamTitle(result.examId)}</TableCell>
                    <TableCell>
                      {result.score}/{result.totalPoints}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-lg font-semibold ${result.passed ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {result.percentage}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {result.passed ? (
                        <Badge className="bg-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Passed
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="mr-1 h-3 w-3" />
                          Failed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(result.completedAt).toLocaleDateString()}</p>
                        <p className="text-muted-foreground">
                          {new Date(result.completedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/results/${result.id}`}>
                          <Button variant="ghost" size="icon" data-testid={`button-view-${result.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePrint(result)}
                          title="Print Single"
                        >
                          <Printer className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <CheckCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              {searchQuery ? "No Results Found" : "No Results Yet"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Results will appear here once students complete exams"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
