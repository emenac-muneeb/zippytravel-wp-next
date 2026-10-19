import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";

const FieldLabel = ({ children, required = false }) => (
    <label className="block text-[13px] sm:text-[14px] font-semibold font-quicksand text-[#A57233] mb-1.5">
        {children}
        {required && <span className="text-[#E11D48] ml-0.5">*</span>}
    </label>
);

const IconBox = ({ src, alt }) => (
    <div className="mr-[-15px] bg-white z-2 flex items-center justify-center w-[34px] h-[34px] shrink-0 border rounded-[4px] border-[#A57233] shadow-[0_0px_2px_rgba(0,0,0,0.06)]">
        <img src={src} alt={alt} className="w-[15px] h-[15px] object-contain" />
    </div>
);

const InputShell = ({ children, className = "", onClick }) => (
    <div
        className={`flex items-center w-full bg-white overflow-hidden transition-colors ${className}`}
        onClick={onClick}
    >
        {children}
    </div>
);

const inputClass =
    "w-full h-[48px] px-3 pl-6 outline-none bg-transparent text-[14px] font-quicksand text-[#2a211c] placeholder:text-[#A9A3AF] placeholder:font-medium border rounded-[7px] border-[#A57233]";

const dropdownItemBase =
    "px-4 py-2.5 text-[14px] font-medium font-quicksand cursor-pointer border-b border-[#F2ECE4] last:border-b-0 hover:bg-[#F8F1E9] text-[#3D3D3D]";

const SectionAccent = () => (
    <div className="flex justify-center" aria-hidden>
        <svg xmlns="http://www.w3.org/2000/svg" width="40.5" height="3.469" viewBox="0 0 40.5 3.469">
            <g transform="translate(-60 -27.531)">
                <line x2="29" transform="translate(60.5 28.031)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
                <line x2="29" transform="translate(71 30.5)" fill="none" stroke="#a57233" strokeLinecap="round" strokeWidth="1" />
            </g>
        </svg>
    </div>
);

const PassengerForm = ({ index, type, setPassengerList, paxSummary = '' }) => {

    const titleOptions = [
        { value: "MR", label: "MR" },
        { value: "MRS", label: "MRS" },
        { value: "MS", label: "MS" },
        { value: "PROF", label: "PROF" },
        { value: "DOCTOR", label: "DOCTOR" },
        { value: "MSTR", label: "MSTR" },
        { value: "MISS", label: "MISS" },
        { value: "INFANT", label: "INFANT" },
        { value: "LORD", label: "LORD" },
        { value: "LADY", label: "LADY" },
        { value: "MISSCHD", label: "MISSCHD" },
        { value: "REV", label: "REV" },
        { value: "HON", label: "HON" },
        { value: "BSS", label: "BSS" }
    ];

    const [dob, setDob] = useState(null);
    const [isTitleOpen, setIsTitleOpen] = useState(false);
    const [isGenderOpen, setIsGenderOpen] = useState(false);
    const [selectedGender, setSelectedGender] = useState(null);

    const defaultTitle = titleOptions.find(item => item.value === "MR");

    const [selectedTitle, setSelectedTitle] = useState(defaultTitle || null);

    const genderOptions = [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "Other", label: "Other" },
    ];

    const handleChange = (field, value) => {
        setPassengerList((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: value,
                type: type
            };
            return updated;
        });
    };

    const handleDobChange = (date) => {
        setDob(date);
        handleChange("dob", date);
    };

    const passengerNo = index < 9 ? `0${index + 1}` : `${index + 1}`;
    const typeLabel = type === "Youth" ? "Infant" : type;
    const headerText = paxSummary
        ? `Passenger ${passengerNo} — ${paxSummary}`
        : `Passenger ${passengerNo} — (${typeLabel})`;

    return (
        <div className="relative bg-[#FFF9F4] rounded-[20px] border border-[#E8DFD2] p-4 sm:p-5 mb-5 font-quicksand">
            <style>{`
                .pax-datepicker .react-datepicker-wrapper {
                    width: 100%;
                }
                .pax-datepicker .react-datepicker__input-container,
                .pax-datepicker .react-datepicker__input-container input {
                    width: 100%;
                }
            `}</style>

            <div className="absolute top-3 left-1/2 -translate-x-1/2">
                <SectionAccent />
            </div>

            <h3 className="text-[16px] sm:text-[18px] font-bold text-secondary font-quicksand text-center pt-3 mb-5">
                {headerText}
            </h3>

            <div className="pax-datepicker space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="relative">
                        <FieldLabel required>Title</FieldLabel>
                        <InputShell
                            className="cursor-pointer"
                            onClick={() => {
                                setIsTitleOpen(!isTitleOpen);
                                setIsGenderOpen(false);
                            }}
                        >
                            <IconBox src="/media/fr-svgs/user.svg" alt="Title" />
                            <input
                                type="text"
                                aria-label="Select Title"
                                placeholder="Select Your Title"
                                value={selectedTitle?.label || ''}
                                readOnly
                                className={`${inputClass} cursor-pointer`}
                            />
                        </InputShell>
                        {isTitleOpen && (
                            <div className="absolute z-20 mt-1.5 w-full bg-white rounded-[7px] shadow-lg border border-[#A57233]/40 max-h-60 overflow-y-auto">
                                {titleOptions?.map((item) => (
                                    <div
                                        key={item.value}
                                        onClick={() => {
                                            setSelectedTitle(item);
                                            setIsTitleOpen(false);
                                            handleChange("title", item.value);
                                        }}
                                        className={`${dropdownItemBase} ${selectedTitle?.value === item.value ? 'bg-[#F8F1E9] text-secondary font-semibold' : ''}`}
                                    >
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <FieldLabel required>Gender</FieldLabel>
                        <InputShell
                            className="cursor-pointer"
                            onClick={() => {
                                setIsGenderOpen(!isGenderOpen);
                                setIsTitleOpen(false);
                            }}
                        >
                            <IconBox src="/media/fr-svgs/user.svg" alt="Gender" />
                            <input
                                type="text"
                                aria-label="Select Gender"
                                placeholder="Select Your Gender"
                                value={selectedGender?.label || ''}
                                readOnly
                                className={`${inputClass} cursor-pointer`}
                            />
                        </InputShell>
                        {isGenderOpen && (
                            <div className="absolute z-20 mt-1.5 w-full bg-white rounded-[7px] shadow-lg border border-[#A57233]/40 max-h-60 overflow-y-auto">
                                {genderOptions.map((item) => (
                                    <div
                                        key={item.value}
                                        onClick={() => {
                                            setSelectedGender(item);
                                            setIsGenderOpen(false);
                                            handleChange("gender", item.value);
                                        }}
                                        className={`${dropdownItemBase} ${selectedGender?.value === item.value ? 'bg-[#F8F1E9] text-secondary font-semibold' : ''}`}
                                    >
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <FieldLabel required>Passenger Name</FieldLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <InputShell>
                            <IconBox src="/media/fr-svgs/user.svg" alt="User" />
                            <input
                                type="text"
                                aria-label="First Name"
                                placeholder="First Name"
                                className={inputClass}
                                onKeyDown={(e) => {
                                    if (e.key >= "0" && e.key <= "9") {
                                        e.preventDefault();
                                    }
                                }}
                                onChange={(e) => handleChange("first_name", e.target.value)}
                            />
                        </InputShell>
                        <InputShell>
                            <input
                                type="text"
                                aria-label="Middle Name"
                                placeholder="Middle Name"
                                className={inputClass}
                                onKeyDown={(e) => {
                                    if (e.key >= "0" && e.key <= "9") {
                                        e.preventDefault();
                                    }
                                }}
                                onChange={(e) => handleChange("middle_name", e.target.value)}
                            />
                        </InputShell>
                        <InputShell>
                            <input
                                type="text"
                                aria-label="Last Name"
                                placeholder="Last Name"
                                className={inputClass}
                                onKeyDown={(e) => {
                                    if (e.key >= "0" && e.key <= "9") {
                                        e.preventDefault();
                                    }
                                }}
                                onChange={(e) => handleChange("last_name", e.target.value)}
                            />
                        </InputShell>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                        <FieldLabel required>Date of Birth</FieldLabel>
                        <InputShell>
                            <IconBox src="/media/fr-svgs/calander.svg" alt="Calendar" />
                            <div className="w-full">
                                <DatePicker
                                    placeholderText="Date of Birth"
                                    className={inputClass}
                                    selected={dob}
                                    onChange={handleDobChange}
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    calendarClassName="custom-datepicker"
                                    popperClassName="z-[9999]"
                                    maxDate={new Date()}
                                    minDate={new Date(1800, 0, 1)}
                                    dateFormat="dd/MM/yyyy"
                                    wrapperClassName="w-full"
                                />
                            </div>
                        </InputShell>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                <SectionAccent />
            </div>
            <div className="h-2" />
        </div>
    )
}

export default PassengerForm
