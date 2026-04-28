import React, { useRef, useState, useEffect } from "react";
import SelectRaw, { components } from 'react-select';
import { customSelectStylesWithOption } from "./Header";
import { getClients, getUserList } from "../api/API";
import { emptyList, notFoundQuery } from "../utilies/helpers";

const Select = SelectRaw && typeof SelectRaw === 'object' && SelectRaw.default ? SelectRaw.default : SelectRaw;

const CustomOption = (props) => {
    const isSelected = props.selectProps.selectedOption?.value === props.data.value;
    return (
        <components.Option {...props} isSelected={isSelected}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>{props.data.label}</span>

                {isSelected && !props.isFocused && <span style={{ fontSize: '1em', fontWeight: 'bold', color: '#bbb', marginLeft: '10px' }}>Selected</span>}
            </div>
        </components.Option>
    );
};

function SelectBootStrap({ selectedOption, setSelectedOption, placeholder = "Select option", fetchType: fetchType_ = "user" }) {
    const fetchType = fetchType_.toLowerCase();
    const selectRef = useRef(null);
    const [search, setSearch] = useState("");
    const [searchList, setSearchList] = useState([]);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                selectRef.current?.blur(); // 👈 when TAB change, remove focus
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    async function fetchUserList(search = "") {
        try {
            const payload = {
                user_status: "1",
                searchKey: search
            };
            const res = await getUserList(payload);
            if (res.status === "ok") {
                const formatData = res.data.map(item => {
                    return {
                        value: item.id,
                        label: item.username
                    }
                });
                setSearchList(formatData);
            } else {
                setSearchList([]);
            }
        } catch (err) {
            console.error(err);
            setSearchList([]);
        }
    };

    async function fetchClients(value) {
        if (!value) {
            setSearchList([]);
            return;
        }

        try {
            const res = await getClients(value);
            if (res.status === "ok") {
                const formatData = res.results?.map(item => {
                    return {
                        value: item.id,
                        label: item.text
                    }
                });
                setSearchList(formatData);
            } else {
                setSearchList([]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchApi = fetchType === "user" ? fetchUserList : fetchClients;

    useEffect(() => {
        search?.length > 2 && fetchApi(search);
    }, [search]);

    return (
        <Select
            ref={selectRef}
            options={searchList}
            placeholder={placeholder}
            className="react-select-container custome-css-select border-radios-5px"
            classNamePrefix="react-select"
            components={{
                DropdownIndicator: () => null,
                IndicatorSeparator: () => null,
                Option: CustomOption
            }}
            noOptionsMessage={() => search.length ? notFoundQuery[0].text : emptyList[0].text}
            styles={customSelectStylesWithOption}
            onInputChange={(value) => setSearch(value)}
            onKeyDown={(e) => {
                if (e.key === "Backspace" && search?.length === 0) {
                    setSelectedOption([]);
                }
            }}
            onChange={(option) => {
                setSelectedOption(option)
                selectRef.current?.blur();
            }}
            onBlur={(e) => {
                setSearch("");
                // setSelectedOption([]);
                setSearchList([]);
                setIsFocused(false);
            }}
            value={isFocused ? [] : selectedOption}
            selectedOption={selectedOption}
            onFocus={() => {
                setIsFocused(true);
                console.log("clicked");
                // setSelectedOption([]);
            }}
        />
    );
}

export default SelectBootStrap;


// user history
// General Lock