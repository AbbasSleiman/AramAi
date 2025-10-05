// components/atoms/clickeable/ExportButton.tsx - Fixed for Syriac text
import { useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    input_type?: 'translate' | 'continue';
    generation_params?: {
      max_new_tokens: number;
      num_beams: number;
    };
  };
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

interface ExportButtonProps {
  session: ChatSession;
  className?: string;
}

const ExportButton = ({ session, className = "" }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const formatMessageTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      // Create a hidden div with the chat content
      const printElement = document.createElement('div');
      printElement.style.position = 'absolute';
      printElement.style.left = '-9999px';
      printElement.style.top = '0';
      printElement.style.width = '794px'; // A4 width in pixels at 96 DPI
      printElement.style.padding = '40px';
      printElement.style.backgroundColor = 'white';
      printElement.style.fontFamily = 'Arial, sans-serif';
      printElement.style.color = 'black';
      printElement.style.fontSize = '14px';
      printElement.style.lineHeight = '1.5';

      // Create the HTML content
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px; color: #333;">${session.title}</h1>
            <div style="margin-top: 10px; font-size: 12px; color: #666;">
              <p style="margin: 5px 0;">Created: ${formatDate(session.created_at)}</p>
              <p style="margin: 5px 0;">Last Updated: ${formatDate(session.updated_at)}</p>
              <p style="margin: 5px 0;">Messages: ${session.messages.length}</p>
            </div>
          </div>
          
          <div style="space-y: 20px;">
            ${session.messages.map((message) => `
              <div style="margin-bottom: 25px; page-break-inside: avoid;">
                <div style="background-color: ${message.type === 'user' ? '#E3F2FD' : '#F5F5F5'}; 
                           padding: 15px; 
                           border-radius: 10px; 
                           border-left: 4px solid ${message.type === 'user' ? '#2196F3' : '#4CAF50'};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong style="color: ${message.type === 'user' ? '#1976D2' : '#388E3C'}; font-size: 14px;">
                      ${message.type === 'user' ? 'User' : 'Assistant'}
                    </strong>
                    <span style="font-size: 11px; color: #666;">
                      ${formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                  <div style="font-size: ${message.type === 'assistant' ? '16px' : '14px'}; 
                             ${message.type === 'assistant' ? 'font-family: monospace;' : ''} 
                             direction: ${message.type === 'assistant' ? 'rtl' : 'ltr'}; 
                             text-align: ${message.type === 'assistant' ? 'right' : 'left'};
                             word-wrap: break-word;
                             line-height: 1.6;">
                    ${message.content.replace(/\n/g, '<br>')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 20px;">
            Exported from AramAI on ${new Date().toLocaleDateString()}
          </div>
        </div>
      `;

      printElement.innerHTML = htmlContent;
      document.body.appendChild(printElement);

      // Wait a bit for fonts to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate canvas from the HTML element
      const canvas = await html2canvas(printElement, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: printElement.scrollHeight
      });

      // Remove the temporary element
      document.body.removeChild(printElement);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height in mm

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      // Generate filename
      const sanitizedTitle = session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${sanitizedTitle}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Save the PDF
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToPDF}
      disabled={isExporting || !session.messages.length}
      className={`!flex !items-center !gap-2 !px-3 !py-2 !bg-green-500 dark:!bg-green-600 !text-white !rounded-md hover:!bg-green-600 dark:hover:!bg-green-700 !transition-colors disabled:!bg-gray-400 disabled:!cursor-not-allowed ${className}`}
      title={session.messages.length === 0 ? "No messages to export" : "Export chat as PDF"}
      type="button"
    >
      {isExporting ? (
        <>
          <div className="!animate-spin !h-4 !w-4 !border-2 !border-white !border-t-transparent !rounded-full"></div>
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <svg className="!w-4 !h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export PDF</span>
        </>
      )}
    </button>
  );
};

export default ExportButton;