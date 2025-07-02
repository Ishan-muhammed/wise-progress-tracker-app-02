import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { SyllabusTableProps } from "./types";

const SyllabusTable = ({ syllabus, onEdit, onDelete }: SyllabusTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Academic Year</TableHead>
          <TableHead>Total Lessons</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {syllabus.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.subject}</TableCell>
            <TableCell>Class {item.class}</TableCell>
            <TableCell>{item.academic_year}</TableCell>
            <TableCell>{item.total_lessons}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(item)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                  className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SyllabusTable;