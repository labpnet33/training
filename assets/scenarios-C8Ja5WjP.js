var e=[{title:{en:`The neighbour never appears`,hi:`Neighbour kabhi nahi dikhta`},ticket:{en:`FGT-HQ and FGT-BR are linked over a /30 but no OSPF neighbour forms. The network statements of both units are shown.`,hi:`FGT-HQ aur FGT-BR /30 se jude hain lekin koi OSPF neighbour nahi banta. Dono units ke network statements dikhaye gaye hain.`},out:`! Reference configuration excerpt (not run in the simulator)
FGT-HQ:
config network
    edit 1
        set prefix 10.0.12.0 255.255.255.252
        set area 0.0.0.0
    next
end
FGT-BR:
config network
    edit 1
        set prefix 10.0.12.0 255.255.255.252
        set area 0.0.0.1
    next
end`,q:{en:`What is wrong?`,hi:`Kya galat hai?`},o:[{en:`The prefix is too long`,hi:`Prefix bahut lamba hai`},{en:`The area IDs differ: 0.0.0.0 versus 0.0.0.1`,hi:`Area IDs alag hain: 0.0.0.0 versus 0.0.0.1`},{en:`The router IDs are equal`,hi:`Router IDs barabar hain`},{en:`OSPF needs a firewall policy`,hi:`OSPF ko firewall policy chahiye`}],a:1,w:{en:`The two ends place the link in different areas, so hellos are rejected. Both ends of a link must use the same area ID.`,hi:`Dono ends link ko alag areas mein rakhte hain, isliye hellos reject hote hain. Link ke dono ends ko same area ID use karna chahiye.`}},{title:{en:`Timers do not agree`,hi:`Timers match nahi karte`},ticket:{en:`The adjacency forms and drops, or never forms, between two FortiGates. The interface settings are shown.`,hi:`Do FortiGates ke beech adjacency banti aur girti hai, ya kabhi nahi banti. Interface settings dikhayi gayi hain.`},out:`! Reference configuration excerpt (not run in the simulator)
FGT-HQ:
config ospf-interface
    edit "TO-BR"
        set interface "port1"
        set hello-interval 10
        set dead-interval 40
    next
end
FGT-BR:
config ospf-interface
    edit "TO-HQ"
        set interface "port1"
        set hello-interval 5
        set dead-interval 20
    next
end`,q:{en:`What must be done?`,hi:`Kya karna chahiye?`},o:[{en:`Increase the cost`,hi:`Cost badhao`},{en:`Change the area type`,hi:`Area type badlo`},{en:`Disable authentication`,hi:`Authentication disable karo`},{en:`Make the hello and dead intervals identical on both ends`,hi:`Dono ends par hello aur dead intervals identical karo`}],a:3,w:{en:`Hello and dead intervals must match for a neighbour relationship. Choose one set of values and apply it on both sides.`,hi:`Neighbour relationship ke liye hello aur dead intervals match hone chahiye. Values ka ek set chuno aur dono sides par lagao.`}},{title:{en:`Prefix not visible at the ISP`,hi:`Prefix ISP ko nahi dikhta`},ticket:{en:`The BGP session to ISP-A is Established, but the ISP does not see 198.51.100.0/24. Relevant configuration and the internal static routes are shown.`,hi:`ISP-A ke saath BGP session Established hai, lekin ISP ko 198.51.100.0/24 nahi dikhta. Relevant configuration aur internal static routes dikhaye gaye hain.`},out:`! Reference configuration excerpt (not run in the simulator)
config router bgp
    config network
        edit 1
            set prefix 198.51.100.0 255.255.255.0
        next
    end
end
Routing table (internal): 198.51.100.0/25 via port3, 198.51.100.128/25 via port3
No route for the exact prefix 198.51.100.0/24`,q:{en:`Why is nothing advertised?`,hi:`Kuch advertise kyun nahi hota?`},o:[{en:`The exact /24 is not in the routing table, so the network statement has nothing to advertise`,hi:`Exact /24 routing table mein nahi hai, isliye network statement ke paas advertise karne ko kuch nahi`},{en:`BGP cannot advertise a /24`,hi:`BGP /24 advertise nahi kar sakta`},{en:`The AS number is private`,hi:`AS number private hai`},{en:`The session needs a firewall policy`,hi:`Session ko firewall policy chahiye`}],a:0,w:{en:`A BGP network statement advertises only a prefix that exists with the same mask in the routing table. Add a blackhole route for the /24.`,hi:`BGP network statement sirf aisa prefix advertise karta hai jo same mask ke saath routing table mein ho. /24 ka blackhole route jodo.`}},{title:{en:`Risk of becoming a transit AS`,hi:`Transit AS banne ka risk`},ticket:{en:`A security review looks at the BGP neighbours of the edge FortiGate. Which risk do they flag?`,hi:`Security review edge FortiGate ke BGP neighbours dekhta hai. Woh kaun sa risk flag karte hain?`},out:`! Reference configuration excerpt (not run in the simulator)
config neighbor
    edit "203.0.113.1"
        set remote-as 65100
        set soft-reconfiguration enable
    next
    edit "203.0.113.5"
        set remote-as 65200
        set soft-reconfiguration enable
    next
end
! no prefix-list-out and no route-map-out on either neighbour`,q:{en:`What is the risk?`,hi:`Risk kya hai?`},o:[{en:`The sessions will not reach Established`,hi:`Sessions Established nahi honge`},{en:`Soft reconfiguration drops routes`,hi:`Soft reconfiguration routes drop karta hai`},{en:`Routes from one provider can be advertised to the other, making the firewall a transit AS`,hi:`Ek provider ke routes doosre ko advertise ho sakte hain, jisse firewall transit AS ban jaata hai`},{en:`The AS numbers must be equal`,hi:`AS numbers barabar hone chahiye`}],a:2,w:{en:`Without an outbound filter the FortiGate advertises what it learns, so the providers can send traffic through it. Add an outbound prefix-list that permits only your own prefix.`,hi:`Outbound filter ke bina FortiGate jo seekhta hai woh advertise karta hai, isliye providers uske through traffic bhej sakte hain. Sirf apna prefix permit karne wali outbound prefix-list lagao.`}},{title:{en:`OSPF or iBGP wins?`,hi:`OSPF ya iBGP jeetta hai?`},ticket:{en:`The prefix 10.50.0.0/16 is learned from OSPF (internal) and from an iBGP peer. Which route enters the routing table?`,hi:`Prefix 10.50.0.0/16 OSPF (internal) aur iBGP peer dono se seekha gaya. Kaun sa route routing table mein aata hai?`},out:`! Reference configuration excerpt (not run in the simulator)
Candidates for 10.50.0.0/16:
  OSPF  distance 110 via 10.0.12.2
  iBGP  distance 200 via 10.255.0.2
Defaults unchanged.`,q:{en:`Which one wins?`,hi:`Kaun jeetta hai?`},o:[{en:`The iBGP route, because BGP is newer`,hi:`iBGP route, kyunki BGP naya hai`},{en:`Both are installed`,hi:`Dono install hote hain`},{en:`Neither, a conflict is raised`,hi:`Koi nahi, conflict raise hota hai`},{en:`The OSPF route, because 110 is lower than 200`,hi:`OSPF route, kyunki 110, 200 se kam hai`}],a:3,w:{en:`Distance decides between sources: OSPF 110 beats iBGP 200 for the same prefix and mask.`,hi:`Sources ke beech distance tay karti hai: same prefix aur mask ke liye OSPF 110, iBGP 200 ko harata hai.`}},{title:{en:`Peering stuck in Active`,hi:`Peering Active mein atki hai`},ticket:{en:`The provider says its side is ready, ping to 203.0.113.1 works, but the BGP session stays Active. A local-in policy excerpt is shown.`,hi:`Provider kehta hai uski side taiyaar hai, 203.0.113.1 ka ping chalta hai, lekin BGP session Active rehta hai. Local-in policy excerpt dikhaya gaya hai.`},out:`! Reference configuration excerpt (not run in the simulator)
config firewall local-in-policy
    edit 1
        set intf "port1"
        set srcaddr "OLD-ISP-PEER"
        set dstaddr "all"
        set service "BGP"
        set action accept
    next
    edit 2
        set intf "port1"
        set srcaddr "all"
        set dstaddr "all"
        set service "BGP"
        set action deny
    next
end
! new peer address 203.0.113.1 is not in OLD-ISP-PEER`,q:{en:`What is the cause?`,hi:`Wajah kya hai?`},o:[{en:`The local-in policy allows TCP 179 only from the old peer and denies the new one`,hi:`Local-in policy TCP 179 sirf purane peer se allow karti hai aur naye ko deny karti hai`},{en:`Ping proves BGP works`,hi:`Ping saabit karta hai ki BGP chalta hai`},{en:`The AS number is wrong`,hi:`AS number galat hai`},{en:`OSPF is blocking BGP`,hi:`OSPF BGP ko block kar raha hai`}],a:0,w:{en:`Ping uses ICMP; BGP uses TCP 179, which the local-in policy blocks for the new address. Add the new peer to the allow rule.`,hi:`Ping ICMP use karta hai; BGP TCP 179 use karta hai, jise local-in policy naye address ke liye block karti hai. Naye peer ko allow rule mein jodo.`}},{title:{en:`Branches have no default route`,hi:`Branches ke paas default route nahi`},ticket:{en:`The head office has an internet default route, yet branches show no default route learned via OSPF. The OSPF settings are shown.`,hi:`Head office ke paas internet default route hai, phir bhi branches OSPF se seekha default route nahi dikhate. OSPF settings dikhayi gayi hain.`},out:`! Reference configuration excerpt (not run in the simulator)
Head office FortiGate:
config router static
    edit 1
        set gateway 203.0.113.1
        set device "port1"
    next
end
config router ospf
    set router-id 10.255.0.1
    ! no default-information-originate`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`A second static route`,hi:`Doosra static route`},{en:`A BGP neighbour`,hi:`BGP neighbour`},{en:`default-information-originate in the OSPF configuration`,hi:`OSPF configuration mein default-information-originate`},{en:`A bigger dead interval`,hi:`Bada dead interval`}],a:2,w:{en:`OSPF does not advertise a default route automatically. Enable default-information-originate on the unit that has the internet route.`,hi:`OSPF default route automatically advertise nahi karta. Jis unit ke paas internet route hai us par default-information-originate enable karo.`}}];export{e as default};