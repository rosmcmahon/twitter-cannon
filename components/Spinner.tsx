import { Button, CircularProgress, LinearProgress, Typography } from '@material-ui/core'
import Axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import theme from '../styles/theme'
import { EnquiryData } from '../types/api-responses'
import { logger } from '../utils/logger'

const sleep = async (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

interface IProps {
	onClickNext: React.MouseEventHandler<HTMLButtonElement>
	address: string
}

const Spinner = ({onClickNext, address}: IProps) => {
	const [disableNext, setDisableNext] = useState(true)
	const [statusMessage, setStatusMessage] = useState('Searching for Twitter post...')
	const [seconds, setSeconds] = useState(0) // in milliseconds
	const waitTime = useRef(0)
	const nextTime = useRef(0)
	const [isProcessing, setIsProcessing] = useState(true)


	/* useEffect that runs once/second to update `seconds` */
	useEffect(() => {
		const interval = 1000
		const timeout = setTimeout(() => {
			setSeconds(seconds + interval)
		}, interval)

		return () => {
			clearTimeout(timeout)
		}
	}, [seconds]) //<= only 'seconds' here

	/* Spinner component useEffect timer. No external state inputs */
	useEffect( () => {
		let tries = 7
		let sleepMs = 5000 //(sleepMs*2 <= 315000) // 6 tries over 5'15s

		const timercode = async () => {
			while(tries--){

				let res = await Axios.get('/api/enquiry', {
					params: {
						address: address
					}
				})
				if(typeof res.data.error !== 'undefined'){
					logger('spinner', 'Enquiry Error', res.data.error)
				}
			
				let data: EnquiryData = res.data

				if(data.processed){
					setIsProcessing(false)
					logger('spinner', 'processed', data)
					if(data.alreadyClaimed){
						setStatusMessage('You have already attempted a claim '+ data.handle)
						break;
					}
					if(!data.approved){
						setStatusMessage('Beep boop! We do not serve bots '+ data.handle)
						break;
					}
					setStatusMessage('Welcome ' + data.handle + '! Click next to continue')
					setDisableNext(false)
					break;
				} 

				if(tries === 0){
					setIsProcessing(false)
					setStatusMessage('Sorry. We have given up searching for the Tweet')
					break;
				}

				/* adjust wait timer */
				
				let wait = sleepMs + data.waitTime
				//TODO: if rate-limit (waitTime) is set, give a "server busy" warning
				logger('spinner', address, 'waiting another', wait, 'ms...')
				setStatusMessage('Searching for tweet...')

				waitTime.current = waitTime.current + wait
				nextTime.current = wait
				await sleep(wait) 
				sleepMs *= 2
			}
		}
		timercode()

		return () => {
			tries = 0
		}
	}, []) //<= reminder, no inputs go here

	return (
		<>
			<Typography variant='h4'>{statusMessage}</Typography>
			<br/>
			{isProcessing ?
				<>
					<LinearProgress variant='buffer' value={(seconds/waitTime.current)*100}/>
					<br/>
					<Typography>Please wait another {Number(nextTime.current/1000).toFixed(0)} seconds</Typography>
				</>
				:
				<><LinearProgress variant='determinate' value={100} color='secondary' /><br/></>
			}
			<br/>
			<Button disabled={disableNext} variant='contained' onClick={onClickNext}>Next</Button>
		</>
	)
}
export default Spinner

