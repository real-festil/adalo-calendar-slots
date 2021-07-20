import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';

const CalendarComponent = (props) => {
  const [masterEmail, setMasterEmail] = useState(null);
  const [masterJobs, setMasterJobs] = useState(null);
  const [startWork, setStartWork] = useState(null);
  const [endWork, setEndWork] = useState(null);
  const [totalSlots, setTotalSlots] = useState(0);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [todayMasterSlots, setTodayMasterSlots] = useState([]);
  // const [todayMasterJobs, setTodayMasterJobs] = useState([]);
  const totalMasterSlots = []

  const getTimeStops = (start, end) => {
    const startTime = moment(start, 'HH:mm');
    const endTime = moment(end, 'HH:mm');

    if( endTime.isBefore(startTime) ){
      endTime.add(1, 'day');
    }

    let timeStops = [];

    while(startTime <= endTime){
      timeStops.push({time: new moment(startTime).format('HH:mm'), isSelected: false});
      startTime.add(30, 'minutes');
    }
    return timeStops;
  }

  useEffect(() => {
    if(props.services && props.services.length) {
      setMasterEmail(props.services[0].masterEmail);
      setStartWork(props.services[0].startWork);
      setEndWork(props.services[0].endWork);
      let slots = 0;
      props.services.forEach(service => {
        slots += Number(service.slots);
      })
      setTotalSlots(slots)
    }
    if(props.masters && props.masters.length) {
      setMasterJobs(props.masters.filter((master) => master.email === masterEmail && master.endTime))
    }
    if(startWork && endWork) {
      setAvailableSlots(getTimeStops(startWork, endWork));
    }
  }, [props])

  useEffect(() => {
    if(props.onSelect && selectedSlots.length) {
      const startTime = moment(props.currentDate);
      startTime.set('hour', selectedSlots[0].time.split(":")[0]);
      startTime.set('minute', selectedSlots[0].time.split(":")[1]);
      const endTime = moment(props.currentDate);
      endTime.set('hour', selectedSlots[selectedSlots.length - 1].time.split(":")[0]);
      endTime.set('minute', selectedSlots[selectedSlots.length - 1].time.split(":")[1]);
      console.log(`Date`, startTime.toDate(), endTime.toDate())
      props.onSelect(startTime.toDate(), endTime.toDate());
    }
  }, [selectedSlots])

  if(masterJobs) {
    if (masterJobs.length) {
      let todayMasterJobs = masterJobs.filter(job => moment(props.currentDate).isSame(moment(job.startTime), 'day'));

      if (props.currentDate) {
        todayMasterJobs = masterJobs.filter(job => moment(props.currentDate).isSame(moment(job.startTime), 'day'))
      } else {
        todayMasterJobs = masterJobs.filter(job => moment().isSame(moment(job.startTime), 'day'))
      }

      if(todayMasterJobs.length) {
        todayMasterJobs.forEach(job => {
          const slots = getTimeStops(moment(job.startTime), moment(job.endTime));
          totalMasterSlots.push(...slots);
          // setTodayMasterSlots([...todayMasterSlots, slots]);
        })
      }
    }
  }

  const setSlots = (time) => {
    const selectedIndex = availableSlots.findIndex(timeAv => time === timeAv.time);
    const slotsRange = availableSlots.slice(selectedIndex, selectedIndex + totalSlots);
    if (selectedIndex + totalSlots >= availableSlots.length) {
      console.log('1')
      return;
    }

    if(totalMasterSlots.length) {
      if(slotsRange.map(sl => sl.time).filter(sl => totalMasterSlots.map(sl => sl.time).includes(sl)).length) {
        console.log('2')
        return;
      }
    }

    setSelectedSlots(availableSlots.filter((slot, index) => index >= selectedIndex && index <= selectedIndex + totalSlots - 1));
  }

  const getBusySlots = (time) => {
    const selectedIndex = availableSlots.findIndex(timeAv => time === timeAv.time);
    const slotsRange = availableSlots.slice(selectedIndex, selectedIndex + totalSlots);
    if (selectedIndex + totalSlots >= availableSlots.length) {
      console.log('1')
      return;
    }

    if(totalMasterSlots.length) {
      if(slotsRange.map(sl => sl.time).filter(sl => totalMasterSlots.map(sl => sl.time).includes(sl)).length) {
        console.log('2')
        return;
      }
    }

    return true;
  }

  const getSlotColor = (time) => {
    if(!getBusySlots(time)) {
      return props.busySlotColor ? props.busySlotColor :'#ababab';
    }

    if(selectedSlots.slice(0, 1).filter(sl => sl.time === time).length) {
      return props.selectedSlotColor ? props.selectedSlotColor : '#62f06e'
    } else if(totalMasterSlots.filter(sl => sl.time === time).length) {
      return props.busySlotColor ? props.busySlotColor :'#ababab';
    } else {
      return props.slotColor ? props.slotColor :'#dedede'
    }
  }

  return (
    <View style={styles.wrapper}>
      {availableSlots && (
        <View style={styles.slotsWrapper}>
          {availableSlots.map(slot => (
            <TouchableOpacity
              key={slot.time}
              onPress={() => setSlots(slot.time)}
              activeOpacity={1}
              style={[
                styles.slot,
                {backgroundColor: getSlotColor(slot.time)}
              ]}
              ><Text>{slot.time}</Text></TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
	wrapper: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
  slotsWrapper: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 40,
  },
  slot: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  }
})

export default CalendarComponent
