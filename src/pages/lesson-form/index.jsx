import { z } from "zod";
import { Input } from "../../components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { classes, grades, tracks } from "../../constants/lesson-constants";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { useSelector } from "react-redux";
import { selectUser } from '../../redux/auth-slice'
import { addDoc, updateDoc } from "firebase/firestore";
import { FieldValue } from 'firebase/firestore'
import { useNavigate } from "react-router-dom";
import { lessonRef, lessonsRef } from '../../constants/refs'
import { uploadFileAndGetUrl } from "../../services/firebase";
import { useRef, useState } from "react";
import { createLesson, updateLesson } from "../../constants/lesson-actions";

const validator = z.object({
  track: z.enum(tracks, { required_error: 'אנא בחר מסלול' }),
  class: z.enum(classes, { required_error: 'אנא בחר חוג' }),
  grade: z.enum(grades, { required_error: 'אנא בחר כיתה' }),
  description: z.string("אנא הזן תיאור למערך השיעור"),
  name: z.string("אנא הזן שם למערך השיעור"),
  fileUrl: z.string().url().optional(),
});

const LessonFormPage = ({ navAfter = true }) => {

  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false)

  const fileRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validator),
  });

  const onSubmit = async (input) => {

    setLoading(true)
    try {

      const lessonDoc = await createLesson(user.uid, input);

      if (file) {
        const fileUrl = await uploadFileAndGetUrl(file, `/lessons/${user.uid}/${lessonDoc.id}.${file.name}`);
        await updateLesson(lessonDoc.id, { fileUrl })
      }

      alert('המערך נוצר בהצלחה')

      if (navAfter)
        navigate(`/lesson/${lessonDoc.id}`)
    }
    catch (e) {
      console.error(e)
      alert('שגיאה ביצירת המערך')
    }

    setLoading(false)
  };

  return (
    <div className="p-5 space-y-5 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-3">יצירת מערך שיעור</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="gap-5 grid grid-cols-2 max-w-[500px]"
      >
        <div>
          <Label>שם המערך</Label>
          <Input type="text" placeholder="שם המערך" {...register("name")} />
        </div>
        <div>
          <Label>מסלול</Label>
          <Select onValueChange={(val) => setValue("track", val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="אנא בחר" />
            </SelectTrigger>
            <SelectContent>
              {tracks.map((item) => {
                return <SelectItem key={item} value={item}>{item}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="class">חוג</Label>
          <Select onValueChange={(val) => setValue("class", val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue className="w-full" placeholder="אנא בחר" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((item) => {
                return <SelectItem key={item} value={item}>{item}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>כיתה</Label>
          <Select onValueChange={(val) => setValue("grade", val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="אנא בחר" />
            </SelectTrigger>
            <SelectContent>
              {grades.map((item) => {
                return <SelectItem key={item} value={item}>{item}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>תיאור המערך</Label>
          <Input type="text" placeholder="טקסט חופשי" {...register("description")} />
        </div>

        <div>
          <Label>העלאת קובץ המערך</Label>
          <Button type="button" onClick={() => fileRef.current.click()}>לחץ כאן להעלאת קובץ המערך</Button>
          {file && <p><b>שם הקובץ:</b> {file.name}</p>}
          <input ref={fileRef} hidden type="file" onChange={async (e) => {
            setFile(e.target.files[0] || null);
          }} />
        </div>

        <Button loading={loading} type="submit" className="p-2 text-white rounded-md">יצירה</Button>
      </form>
    </div>
  );
};

export default LessonFormPage;
