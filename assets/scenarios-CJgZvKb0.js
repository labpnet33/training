var e=[{title:{en:`Half the sessions are denied`,hi:`Aadhe sessions deny hote hain`},ticket:{en:`After moving to SD-WAN, about half of the users cannot browse. The configuration excerpt is shown. What is wrong?`,hi:`SD-WAN par jaane ke baad lagbhag aadhe users browse nahi kar paate. Configuration excerpt dikhaya gaya hai. Kya galat hai?`},out:`! Configuration excerpt (illustrative; you can build this in the module labs)
config system sdwan
    set status enable
    config members
        edit 1
            set interface "port1"
        next
        edit 2
            set interface "port4"
        next
    end
end
config router static
    edit 1
        set sdwan-zone "virtual-wan-link"
    next
end
config firewall policy
    edit 1
        set srcintf "port2"
        set dstintf "port1"
        set action accept
        set nat enable
    next
end`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Add a third member`,hi:`Teesra member jodo`},{en:`Use the zone virtual-wan-link as dstintf of the policy`,hi:`Policy ke dstintf mein zone virtual-wan-link use karo`},{en:`Disable nat`,hi:`nat disable karo`},{en:`Set the member cost to 0`,hi:`Member cost 0 karo`}],a:1,w:{en:`Sessions that SD-WAN sends out of port4 find no policy for port2 to port4 and are denied. The policy must point at the zone.`,hi:`Jo sessions SD-WAN port4 se bhejta hai unhe port2 se port4 ki policy nahi milti aur deny ho jaate hain. Policy zone ko point karni chahiye.`}},{title:{en:`Voice ignores the SLA`,hi:`Voice SLA ko ignore karti hai`},ticket:{en:`Voice calls stay on a lossy link although an SLA rule exists. The rules are listed in order.`,hi:`Voice calls lossy link par hi rehti hain jabki SLA rule maujood hai. Rules order mein listed hain.`},out:`! Configuration excerpt (illustrative; you can build this in the module labs)
config service
    edit 1
        set name "ALL-TRAFFIC"
        set mode load-balance
        set dst "all"
        set src "all"
        set priority-members 1 2
    next
    edit 2
        set name "VOICE"
        set mode sla
        set src "VOICE-NET"
        set priority-members 1 2
    next
end`,q:{en:`Why does the voice rule never act?`,hi:`Voice rule kabhi kaam kyun nahi karta?`},o:[{en:`SLA mode does not exist`,hi:`SLA mode maujood nahi`},{en:`VOICE-NET is a zone`,hi:`VOICE-NET zone hai`},{en:`The members are in the wrong order`,hi:`Members galat order mein hain`},{en:`Rule 1 matches all traffic first, so rule 2 is never reached`,hi:`Rule 1 pehle saare traffic se match karta hai, isliye rule 2 tak baat nahi pahunchti`}],a:3,w:{en:`Rules are matched top-down and the first match wins. A catch-all rule above a specific one hides it. Move the specific rule up.`,hi:`Rules upar se neeche match hote hain aur pehla match jeetta hai. Specific rule ke upar catch-all use chhupa deta hai. Specific rule ko upar le jao.`}},{title:{en:`Every link is out of SLA`,hi:`Har link out of SLA hai`},ticket:{en:`After a tuning session, voice rules behave as if no link is ever good. The SLA is shown.`,hi:`Tuning session ke baad voice rules aise behave karte hain jaise koi link kabhi achhi nahi. SLA dikhaya gaya hai.`},out:`! Configuration excerpt (illustrative; you can build this in the module labs)
config sla
    edit 1
        set latency-threshold 5
        set jitter-threshold 1
        set packetloss-threshold 0
    next
end`,q:{en:`What is the likely problem?`,hi:`Sambhavit problem kya hai?`},o:[{en:`The thresholds are unrealistically strict, so no member can meet them`,hi:`Thresholds itne strict hain ki koi member poora nahi kar sakta`},{en:`The health check is disabled`,hi:`Health check disabled hai`},{en:`Packet loss is not a valid threshold`,hi:`Packet loss valid threshold nahi`},{en:`The zone name is wrong`,hi:`Zone ka naam galat hai`}],a:0,w:{en:`A 5 ms latency, 1 ms jitter and zero loss target is unrealistic for internet links. Set thresholds from the real need of voice and tune with data.`,hi:`5 ms latency, 1 ms jitter aur zero loss ka target internet links ke liye unrealistic hai. Thresholds voice ki asli zaroorat se set karo aur data se tune karo.`}},{title:{en:`Failover takes minutes`,hi:`Failover mein minutes lagte hain`},ticket:{en:`Users lose connectivity for a long time when ISP-A fails. The health check settings are shown.`,hi:`ISP-A fail hone par users ka connectivity bahut der ke liye jaata hai. Health check settings dikhayi gayi hain.`},out:`! Configuration excerpt (illustrative; you can build this in the module labs)
config health-check
    edit "INTERNET-PING"
        set server "192.0.2.53"
        set protocol ping
        set interval 5000
        set failtime 20
        set recoverytime 5
    next
end`,q:{en:`Roughly how long until the member is declared dead?`,hi:`Member kitni der mein dead declare hota hai?`},o:[{en:`About 5 seconds`,hi:`Lagbhag 5 second`},{en:`About 20 seconds`,hi:`Lagbhag 20 second`},{en:`About 100 seconds`,hi:`Lagbhag 100 second`},{en:`Immediately`,hi:`Turant`}],a:2,w:{en:`Detection time is about interval times failtime: 5000 ms times 20 is 100 seconds. Reduce the values to a few seconds.`,hi:`Detection time lagbhag interval guna failtime hai: 5000 ms guna 20 yaani 100 second. Values ko kuch seconds tak kam karo.`}},{title:{en:`Probe only proves the first hop`,hi:`Probe sirf pehla hop saabit karta hai`},ticket:{en:`During an ISP upstream failure, SD-WAN kept sending traffic into the failing link. The health check is shown.`,hi:`ISP upstream failure ke dauran SD-WAN failing link mein traffic bhejta raha. Health check dikhaya gaya hai.`},out:`! Configuration excerpt (illustrative; you can build this in the module labs)
config health-check
    edit "GW-CHECK"
        set server "203.0.113.1"
        set protocol ping
        set interval 1000
        set failtime 5
    next
end
! 203.0.113.1 is the ISP-A gateway on the first hop`,q:{en:`Why did the member stay alive?`,hi:`Member alive kyun raha?`},o:[{en:`Ping cannot detect failures`,hi:`Ping failures detect nahi kar sakta`},{en:`failtime is too high`,hi:`failtime bahut high hai`},{en:`The interval is too short`,hi:`Interval bahut chhota hai`},{en:`It probes only the ISP gateway, which keeps answering during an upstream failure`,hi:`Woh sirf ISP gateway ko probe karta hai jo upstream failure mein bhi jawab deta rehta hai`}],a:3,w:{en:`The first hop still answers while the internet beyond it is broken. Probe a reliable target beyond the ISP, or use a protocol that proves your service.`,hi:`Pehla hop jawab deta rehta hai jabki uske aage ka internet toota hota hai. ISP ke aage ka reliable target probe karo, ya aisa protocol use karo jo aapki service saabit kare.`}},{title:{en:`Expected share of traffic`,hi:`Traffic ka expected hissa`},ticket:{en:`The team set weight-based load balancing for unclassified traffic. What share should port1 carry?`,hi:`Team ne unclassified traffic ke liye weight-based load balancing set kiya. port1 ko kitna hissa uthana chahiye?`},out:`! Configuration excerpt (illustrative; you can build this in the module labs)
config system sdwan
    set load-balance-mode weight-based
    config members
        edit 1
            set interface "port1"
            set weight 70
        next
        edit 2
            set interface "port4"
            set weight 30
        next
    end
end`,q:{en:`What proportion of sessions goes to port1?`,hi:`Sessions ka kitna hissa port1 par jaata hai?`},o:[{en:`About 70 percent`,hi:`Lagbhag 70 percent`},{en:`50 percent`,hi:`50 percent`},{en:`About 30 percent`,hi:`Lagbhag 30 percent`},{en:`100 percent`,hi:`100 percent`}],a:0,w:{en:`Weight-based mode shares sessions in proportion to member weights, so 70 and 30 give roughly 70 percent and 30 percent. Each session stays on one member.`,hi:`Weight-based mode member weights ke anupaat mein sessions baantta hai, isliye 70 aur 30 lagbhag 70 percent aur 30 percent dete hain. Har session ek member par rehta hai.`}},{title:{en:`port4 cannot become a member`,hi:`port4 member nahi ban sakta`},ticket:{en:`The unit refuses to add port4 as an SD-WAN member. The existing static routes are shown.`,hi:`Unit port4 ko SD-WAN member banane se mana karta hai. Existing static routes dikhaye gaye hain.`},out:`! Configuration excerpt (illustrative; you can build this in the module labs)
config router static
    edit 1
        set gateway 203.0.113.1
        set device "port1"
    next
    edit 2
        set gateway 198.51.100.1
        set device "port4"
        set distance 20
    next
end`,q:{en:`What must you do first?`,hi:`Pehle kya karna padega?`},o:[{en:`Raise the distance to 30`,hi:`Distance 30 karo`},{en:`Reboot the unit`,hi:`Unit reboot karo`},{en:`Remove or replace the floating route that uses port4 by name`,hi:`port4 ko naam se use karne wala floating route hatao ya badlo`},{en:`Disable NAT`,hi:`NAT disable karo`}],a:2,w:{en:`An interface that is referenced by routes, policies or DHCP cannot become a member. Delete the old floating route and use one default route for the zone.`,hi:`Jo interface routes, policies ya DHCP se referenced ho woh member nahi ban sakta. Purana floating route delete karo aur zone ke liye ek default route use karo.`}}];export{e as default};