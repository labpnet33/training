var e=(e,t)=>({en:e,hi:t}),t=[{title:e(`Every link is out of SLA`,`Har link out of SLA hai`),ticket:e(`A new voice rule finds no eligible member and falls back to default routing. The health check shows both members alive with sla_map 0x0 although the ISPs are clean. The excerpt shows the SLA target an engineer typed. What is wrong?`,`Naya voice rule koi eligible member nahi dhoondh paata aur default routing par gir jaata hai. Health check dono members ko alive par sla_map 0x0 ke saath dikhata hai jabki ISPs saaf hain. Excerpt engineer ka type kiya SLA target dikhata hai. Kya galat hai?`),out:`! Reference configuration excerpt (not run in the simulator)
config system sdwan
    config health-check
        edit "HUB-PING"
            set server "10.255.0.1"
            set protocol ping
            set members 1 2
            config sla
                edit 1
                    set packetloss-threshold 1
                next
            end
        next
    end
end
! illustrative result: both members alive, sla_map=0x0`,q:e(`What is the most likely cause?`,`Sabse sambhavit wajah kya hai?`),o:[e(`The members are in the wrong zone`,`Members galat zone mein hain`),e(`ping cannot have an SLA`,`ping ka SLA nahi ho sakta`),e(`Latency and jitter thresholds were left at their very small defaults, so no member can pass`,`Latency aur jitter thresholds bahut chhote defaults par chhode gaye, isliye koi member pass nahi kar sakta`),e(`The probe interval is too long`,`Probe interval bahut lamba hai`)],a:2,w:e(`All thresholds of an SLA target must pass together. Unset thresholds keep very small default values, so every real link fails them. Set latency, jitter and packet loss explicitly (for example 150, 30 and 1 for voice).`,`Ek SLA target ke saare thresholds saath mein pass hone chahiye. Unset thresholds bahut chhote default values rakhte hain, isliye har asli link unhe fail karti hai. Latency, jitter aur packet loss explicitly set karo (jaise voice ke liye 150, 30 aur 1).`)},{title:e(`Dead member, working link`,`Dead member, chalti link`),ticket:e(`Member 2 (port2) is reported dead on the dashboard, but a laptop forced over ISP2 browses normally. A sniffer on port2 filtered on the probe server shows the lines below. What do they prove?`,`Dashboard par member 2 (port2) dead hai, par ISP2 par forced laptop normally browse karta hai. Probe server par filter kiya port2 ka sniffer neeche ki lines dikhata hai. Yeh kya prove karti hain?`),out:`! Reference configuration (not run in the simulator) - illustrative output format
BR1-FGT # diagnose sniffer packet port2 'host 192.0.2.53 and icmp' 4 6 l
2026-10-02 10:01:00.101 port2 out 198.51.100.2 -> 192.0.2.53: icmp: echo request
2026-10-02 10:01:00.601 port2 out 198.51.100.2 -> 192.0.2.53: icmp: echo request
2026-10-02 10:01:01.101 port2 out 198.51.100.2 -> 192.0.2.53: icmp: echo request`,q:e(`What is the next step?`,`Agla step kya hai?`),o:[e(`The probe leaves but no reply returns: test the same protocol manually and change the probe target or protocol`,`Probe nikalta hai par reply wapas nahi aata: usi protocol ko manually test karo aur probe target ya protocol badlo`),e(`The FortiGate is not sending probes: reboot it`,`FortiGate probes nahi bhej raha: reboot karo`),e(`Raise the SLA thresholds`,`SLA thresholds badhao`),e(`Disable the zone`,`Zone disable karo`)],a:0,w:e(`The probes leave (out) but nothing comes back (no in). The target or the protocol is filtered or unreachable through ISP2, while user traffic works. Change to a robust target, add a second server, or use a different protocol. Rebooting or changing SLA numbers does not fix a probe that is not answered.`,`Probes nikalte hain (out) par kuch wapas nahi aata (in nahi). ISP2 ke through target ya protocol filtered ya unreachable hai, jabki user traffic chalta hai. Robust target par jao, doosra server jodo, ya alag protocol use karo. Reboot ya SLA numbers badalna us probe ko theek nahi karta jiska jawab nahi aata.`)},{title:e(`The LTE link that never settles`,`LTE link jo kabhi settle nahi hoti`),ticket:e(`Voice calls over a rural branch's LTE link are constantly interrupted. The SLA log shows the member switching state every few seconds. The health-check settings are below. What change fits best?`,`Rural branch ki LTE link par voice calls lagataar tootti hain. SLA log member ko har kuch seconds mein state badalte dikhata hai. Health-check settings neeche hain. Kaun sa badlaav sabse fit hai?`),out:`! Reference configuration excerpt (not run in the simulator)
config system sdwan
    config health-check
        edit "LTE-CHECK"
            set server "192.0.2.53"
            set protocol ping
            set interval 500
            set failtime 2
            set recoverytime 2
            set members 2
        next
    end
end`,q:e(`Which change reduces the flapping?`,`Kaun sa badlaav flapping kam karta hai?`),o:[e(`Set failtime 1 and recoverytime 1`,`failtime 1 aur recoverytime 1 set karo`),e(`Disable the health check`,`Health check disable karo`),e(`Set protocol to udp-echo only`,`Protocol sirf udp-echo set karo`),e(`Raise failtime (for example 4) and make recoverytime longer (for example 10)`,`failtime badhao (jaise 4) aur recoverytime lamba karo (jaise 10)`)],a:3,w:e(`With failtime 2 and recoverytime 2 a single second of bad signal flips the state. A higher failtime ignores blips, and a longer recoverytime makes the link earn trust. Smaller values make it worse; disabling the check removes the protection.`,`failtime 2 aur recoverytime 2 ke saath kharab signal ka ek second state flip kar deta hai. Zyada failtime blips ko ignore karta hai, aur lamba recoverytime link ko bharosa kamane deta hai. Chhote values halat bigaadte hain; check disable karna protection hata deta hai.`)},{title:e(`Healthy tunnels reported dead`,`Healthy tunnels dead report hue`),ticket:e(`After a template rollout all overlay members on thirty spokes are dead, yet traffic passes over the tunnels. The health check uses a source address that is the spoke loopback. The hub shows no route to that loopback. What is the fix?`,`Template rollout ke baad tees spokes par saare overlay members dead hain, phir bhi tunnels par traffic pass hota hai. Health check spoke loopback wala source address use karta hai. Hub us loopback tak koi route nahi dikhata. Fix kya hai?`),out:`! Reference configuration excerpt (not run in the simulator)
config system sdwan
    config health-check
        edit "HUB1-PING"
            set server "10.255.0.1"
            set protocol ping
            set source 10.255.1.11
            set members 3 4
        next
    end
end
! hub: no route to 10.255.1.11 (loopback of the spoke is not advertised)`,q:e(`What should you do?`,`Aapko kya karna chahiye?`),o:[e(`Lower the probe interval`,`Probe interval kam karo`),e(`Make the hub able to route back to the spoke loopback (advertise it in routing)`,`Hub ko spoke loopback tak route back karne laayak banao (use routing mein advertise karo)`),e(`Remove the tunnels from the zone`,`Tunnels ko zone se hatao`),e(`Change the protocol to ftp`,`Protocol ko ftp karo`)],a:1,w:e(`The probe reaches the hub and the hub answers, but the reply has no route back to the source address, so it is lost and the members look dead. Advertise or route the spoke loopback to the hub. Timers, zones and protocols are not the issue.`,`Probe hub tak pahunchta hai aur hub jawab deta hai, par reply ke paas source address tak route nahi hai, isliye woh kho jaata hai aur members dead dikhte hain. Spoke loopback ko hub tak advertise ya route karo. Timers, zones aur protocols issue nahi hain.`)},{title:e(`How long until the link is declared dead?`,`Link ko dead declare hone mein kitna samay lagega?`),ticket:e(`A backup LTE link uses the health-check settings below to save data. The primary fibre is cut. How long before this check marks the LTE link dead if it also fails?`,`Backup LTE link data bachane ke liye neeche ki health-check settings use karti hai. Primary fibre kat jaati hai. Agar yeh LTE link bhi fail ho to is check ko use dead mark karne mein kitna samay lagega?`),out:`! Reference configuration excerpt (not run in the simulator)
config system sdwan
    config health-check
        edit "LTE-SLOW"
            set server "192.0.2.53"
            set protocol ping
            set interval 2000
            set probe-timeout 1000
            set failtime 6
            set recoverytime 5
            set members 2
        next
    end
end`,q:e(`Detection time is about:`,`Detection time lagbhag:`),o:[e(`2 seconds`,`2 seconds`),e(`6 seconds`,`6 seconds`),e(`12 seconds`,`12 seconds`),e(`10 seconds`,`10 seconds`)],a:2,w:e(`Detection time is roughly interval times failtime: 2000 ms x 6 = 12 seconds (plus up to the probe timeout for the last probe). Recovery would be about 2000 ms x 5 = 10 seconds.`,`Detection time lagbhag interval guna failtime hota hai: 2000 ms x 6 = 12 seconds (plus aakhri probe ke liye probe timeout tak). Recovery lagbhag 2000 ms x 5 = 10 seconds hoti.`)},{title:e(`The passive check with no data`,`Passive check jiske paas data nahi`),ticket:e(`An engineer created a passive health check to measure real SaaS traffic, but the check never reports measurements. The traffic matches firewall policy 10. The configuration is shown. What is missing?`,`Ek engineer ne real SaaS traffic naapne ke liye passive health check banaya, par check kabhi measurements report nahi karta. Traffic firewall policy 10 se match karta hai. Configuration dikhayi gayi hai. Kya missing hai?`),out:`! Reference configuration excerpt (not run in the simulator)
config system sdwan
    config health-check
        edit "PASSIVE-SAAS"
            set detect-mode passive
            set members 1 2
        next
    end
end
config firewall policy
    edit 10
        set srcintf "port3"
        set dstintf "virtual-wan-link"
        set action accept
        set nat enable
    next
end`,q:e(`What is missing?`,`Kya missing hai?`),o:[e(`The setting passive-wan-health-measurement enable on firewall policy 10`,`Firewall policy 10 par passive-wan-health-measurement enable setting`),e(`A second health check`,`Doosra health check`),e(`A shorter interval`,`Chhota interval`),e(`A TWAMP responder`,`TWAMP responder`)],a:0,w:e(`Passive measurement only takes data from sessions that match a firewall policy with passive-wan-health-measurement enabled. Interval and responders are for active probes, and a second check would also have no data.`,`Passive measurement sirf un sessions se data leta hai jo passive-wan-health-measurement enabled wali firewall policy se match karte hain. Interval aur responders active probes ke liye hain, aur doosre check ke paas bhi data nahi hota.`)},{title:e(`Voice is bad but the SLA shows green`,`Voice kharab hai par SLA green dikhta hai`),ticket:e(`Voice calls on ISP1 are choppy in the evening, yet the SLA map shows ISP1 meets SLA 1. The SLA target is below. Why does the check not catch the problem?`,`ISP1 par shaam ko voice calls choppy hain, phir bhi SLA map ISP1 ko SLA 1 meet karta dikhata hai. SLA target neeche hai. Check problem kyun nahi pakadta?`),out:`! Reference configuration excerpt (not run in the simulator)
config system sdwan
    config health-check
        edit "VOICE-CHECK"
            set server "192.0.2.53"
            set protocol ping
            set members 1 2
            config sla
                edit 1
                    set latency-threshold 150
                next
            end
        next
    end
end`,q:e(`What is the best improvement?`,`Sabse achha sudhaar kya hai?`),o:[e(`Raise the latency threshold`,`Latency threshold badhao`),e(`Lower the failtime to 1`,`failtime ko 1 karo`),e(`Add the zone to the policy`,`Policy mein zone jodo`),e(`Add jitter and packet-loss thresholds (for example 30 ms and 1 percent), and consider a UDP or real-service probe`,`Jitter aur packet-loss thresholds jodo (jaise 30 ms aur 1 percent), aur UDP ya real-service probe par vichar karo`)],a:3,w:e(`Voice quality depends on loss and jitter as well as latency. The target checks only latency, and an ICMP probe may be treated differently from voice. Add all three thresholds and measure with a probe that behaves like the real traffic.`,`Voice quality latency ke saath loss aur jitter par bhi nirbhar hai. Target sirf latency check karta hai, aur ICMP probe voice se alag treat ho sakta hai. Teeno thresholds jodo aur aise probe se naapo jo asli traffic jaisa behave kare.`)}];export{t as default};