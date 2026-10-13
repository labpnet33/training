var e=(e,t)=>({en:e,hi:t}),t=[{title:e(`The rule that never matches`,`Woh rule jo kabhi match nahi karta`),ticket:e(`A video rule never gets hits. The excerpt shows the rule list order. What is wrong?`,`Video rule ko kabhi hits nahi milte. Excerpt rule list order dikhata hai. Kya galat hai?`),out:`! Reference configuration (not run in the simulator) - illustrative excerpt
config system sdwan
    config service
        edit 1
            set name "All-to-cheap"
            set mode manual
            set priority-members 2 1
        next
        edit 2
            set name "Video"
            set mode priority
            set internet-service enable
            set internet-service-name "Example-Video-Service"
            set priority-members 1 2
        next
    end
end`,q:e(`What is the cause?`,`Karan kya hai?`),o:[e(`The video rule is below a rule that matches everything`,`Video rule ek aise rule ke neeche hai jo sab kuch match karta hai`),e(`Priority mode cannot match services`,`Priority mode services match nahi kar sakta`),e(`Members are in the wrong order`,`Members galat order mein hain`),e(`ISDB is unlicensed`,`ISDB unlicensed hai`)],a:0,w:e(`Rule 1 has no criteria, so it matches everything and wins by order. Move the specific rule above it or narrow rule 1.`,`Rule 1 mein koi criteria nahi, isliye woh sab kuch match karta hai aur order se jeetta hai. Specific rule ko uske upar le jao ya rule 1 ko narrow karo.`)},{title:e(`Cheapest link ignored`,`Sasti link ignore hui`),ticket:e(`Management wants SaaS to prefer the cheap broadband, but traffic uses MPLS. The rule uses mode priority with latency. What should change?`,`Management chahta hai SaaS sasti broadband prefer kare, par traffic MPLS use karta hai. Rule latency ke saath mode priority use karta hai. Kya badalna chahiye?`),out:`! Reference configuration (not run in the simulator) - illustrative excerpt
config system sdwan
    config members
        edit 1
            set interface "port1"
            set cost 10
        next
        edit 2
            set interface "port2"
            set cost 50
        next
    end
    config service
        edit 3
            set name "SaaS"
            set mode priority
            set link-cost-factor latency
            set priority-members 1 2
        next
    end
end`,q:e(`What is the best fix?`,`Sabse acha fix kya hai?`),o:[e(`Raise the MPLS cost`,`MPLS cost badhao`),e(`Change to mode sla with an SLA target, so cost decides among members that meet it`,`SLA target ke saath mode sla karo, taaki SLA meet karne wale members mein cost tay kare`),e(`Disable the health check`,`Health check disable karo`),e(`Use mode manual with member 2 only`,`Sirf member 2 ke saath mode manual use karo`)],a:1,w:e(`Best quality chooses by measured latency, ignoring cost. Lowest Cost (SLA) filters by SLA and then picks the cheapest.`,`Best quality measured latency se chunta hai, cost ignore karta hai. Lowest Cost (SLA) SLA se filter karke sabse sasta chunta hai.`)},{title:e(`First meeting always on the wrong link`,`Pehli meeting hamesha galat link par`),ticket:e(`The first session to a meeting server uses the default path; later sessions use the right link. The rule matches an application signature only. What explains it?`,`Meeting server ka pehla session default path use karta hai; baad ke sessions sahi link. Rule sirf application signature match karta hai. Isse kya explain hota hai?`),out:`! Reference configuration (not run in the simulator) - illustrative excerpt
config system sdwan
    config service
        edit 4
            set name "Meetings"
            set mode priority
            set internet-service enable
            set internet-service-app-ctrl 41468
            set priority-members 1 2
        next
    end
end
! 41468 is a placeholder application ID`,q:e(`What is the explanation and a mitigation?`,`Explanation aur mitigation kya hai?`),o:[e(`The cache is learned from the first session; add an ISDB entry or address match for first-packet certainty`,`Cache pehle session se seekhi jaati hai; pehle-packet certainty ke liye ISDB entry ya address match jodo`),e(`The tunnel is down`,`Tunnel down hai`),e(`Hold-down time is too long`,`Hold-down time bahut lamba hai`),e(`NAT is missing`,`NAT missing hai`)],a:0,w:e(`Application signatures need inspection, so the destination is cached afterwards. ISDB or an address object classifies at the first packet.`,`Application signatures ko inspection chahiye, isliye destination baad mein cache hoti hai. ISDB ya address object pehle packet par classify karta hai.`)},{title:e(`Stuck on broadband`,`Broadband par atka`),ticket:e(`The primary link recovered 10 minutes ago and the health check shows alive, but a rule keeps traffic on broadband. The excerpt shows the rule. Why?`,`Primary link 10 minute pehle recover hui aur health check alive dikhata hai, par rule traffic ko broadband par rakhta hai. Excerpt rule dikhata hai. Kyun?`),out:`! Reference configuration (not run in the simulator) - illustrative excerpt
config system sdwan
    config service
        edit 5
            set name "ERP"
            set mode priority
            set health-check "HQ-Loopback"
            set priority-members 1 2
            set hold-down-time 900
        next
    end
end`,q:e(`What is the cause?`,`Karan kya hai?`),o:[e(`The health check is broken`,`Health check toota hai`),e(`A hold-down time of 900 seconds delays reuse of the recovered member`,`900 seconds ka hold-down time recovered member ke reuse ko delay karta hai`),e(`Priority mode never fails back`,`Priority mode kabhi fail back nahi karta`),e(`The tie-break is zone`,`Tie-break zone hai`)],a:1,w:e(`The rule waits 900 seconds after recovery before using the member. Lower it if the link is stable.`,`Rule recovery ke baad member use karne se pehle 900 seconds rukta hai. Link stable ho to ise kam karo.`)},{title:e(`Backup link carries unclassified traffic`,`Backup link unclassified traffic uthati hai`),ticket:e(`Backup broadband carries 40 percent of traffic although all important flows are in rules. What is happening?`,`Backup broadband 40 percent traffic uthati hai jabki saare important flows rules mein hain. Kya ho raha hai?`),out:`! Reference configuration (not run in the simulator) - illustrative excerpt
config system sdwan
    set load-balance-mode source-ip-based
    config service
        edit 1
            set name "Voice"
            set mode priority
            set priority-members 1 2
        next
    end
end
! no catch-all rule is configured`,q:e(`What is the cleanest fix?`,`Sabse saaf fix kya hai?`),o:[e(`Delete the voice rule`,`Voice rule delete karo`),e(`Add an explicit catch-all rule that prefers the primary`,`Explicit catch-all rule jodo jo primary prefer kare`),e(`Disable the backup interface`,`Backup interface disable karo`),e(`Lower the probe interval`,`Probe interval kam karo`)],a:1,w:e(`Unmatched traffic goes to the implicit rule, which balances across equal-cost members. A catch-all makes the default deliberate.`,`Unmatched traffic implicit rule par jaata hai, jo equal-cost members mein balance karta hai. Catch-all default ko jaanboojhkar banata hai.`)},{title:e(`Rule matches but nothing flows`,`Rule match hota hai par kuch nahi chalta`),ticket:e(`A new rule for a partner network shows hits, yet users cannot reach the partner. A policy trace shows the traffic denied. What does it prove?`,`Partner network ka naya rule hits dikhata hai, phir bhi users partner tak nahi pahunch paate. Policy trace traffic ko denied dikhata hai. Yeh kya prove karta hai?`),out:`! Reference configuration (not run in the simulator) - illustrative result
rule "Partner" hits: increasing
firewall policy match for the session: implicit deny (no policy permits LAN to the overlay zone)`,q:e(`What is the lesson?`,`Seekh kya hai?`),o:[e(`Rules do not permit traffic; add a firewall policy for the path`,`Rules traffic permit nahi karte; path ke liye firewall policy jodo`),e(`The rule must be deleted`,`Rule delete karna hoga`),e(`The health check failed`,`Health check fail hua`),e(`Hold-down time is too short`,`Hold-down time bahut chhota hai`)],a:0,w:e(`The rule selects the member; the firewall policy still permits or denies. Add a policy from the LAN to the overlay zone.`,`Rule member chunta hai; firewall policy abhi bhi permit ya deny karti hai. LAN se overlay zone tak policy jodo.`)},{title:e(`Voice flaps between links`,`Voice links ke beech flap karti hai`),ticket:e(`Calls move between two links every few seconds and users hear clicks. The links differ by about 2 ms latency. What combination should you apply?`,`Calls har kuch seconds mein do links ke beech jaati hain aur users clicks sunte hain. Links mein lagbhag 2 ms latency ka fark hai. Kaun sa combination lagaoge?`),out:`! Reference configuration (not run in the simulator) - illustrative excerpt
config system sdwan
    config service
        edit 1
            set name "Voice"
            set mode priority
            set link-cost-factor latency
            set priority-members 1 2
        next
    end
end`,q:e(`What is the best answer?`,`Sabse acha jawab kya hai?`),o:[e(`Add SLA targets or a threshold, hold-down time and use jitter as the factor`,`SLA targets ya threshold, hold-down time jodo aur jitter ko factor banao`),e(`Switch to manual and remove the health check`,`Manual par jao aur health check hatao`),e(`Increase the interval to 60 seconds`,`Interval ko 60 seconds karo`),e(`Remove the second link`,`Doosri link hatao`)],a:0,w:e(`Small metric differences should not move sessions. Stability controls plus a voice-appropriate metric stop the flapping.`,`Chhote metric farq sessions ko nahi hilane chahiye. Stability controls aur voice ke liye sahi metric flapping rokte hain.`)}];export{t as default};