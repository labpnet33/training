var e={id:`bgp-overlay`,h:{en:`BGP over the overlay: iBGP, eBGP, neighbor groups and route reflectors`,hi:`Overlay par BGP: iBGP, eBGP, neighbor groups aur route reflectors`},body:{en:`
<p>With three branches you can use static routes. With three hundred you cannot: every new branch would need a route on every hub and every other branch. <b>BGP</b> solves this. Each spoke advertises its LAN to the hub, the hub passes the prefixes on, and a new branch only needs its own small configuration. In this chapter we run BGP <b>over the overlay tunnels</b> and peer on the <b>tunnel addresses</b> (the simplest design). Peering on loopbacks is the next chapter.</p>
<h3>iBGP or eBGP?</h3>
<table class="cmp"><tr><th></th><th>iBGP (one AS, for example 65000)</th><th>eBGP (spokes in other ASes)</th></tr><tr><td>Distance</td><td>200, loses to a static route (10)</td><td>20</td></tr><tr><td>Loop prevention</td><td>Split horizon: iBGP routes are not passed to other iBGP peers, so a hub needs <b>route reflection</b></td><td>AS path; each spoke needs its own AS number or the hub must use as-override</td></tr><tr><td>Next hop</td><td>Kept unchanged by a route reflector</td><td>Changed to the sender on each hop</td></tr><tr><td>Typical use</td><td>Fortinet reference designs with ADVPN</td><td>When different teams own the branches, or a provider needs AS separation</td></tr></table>
<p>The Fortinet SD-WAN reference designs normally use <b>iBGP with the hub as route reflector</b>. The reason is the next hop: when spoke BR1 advertises 10.1.1.0/24 to the hub and the hub reflects it to BR2, the next hop stays the tunnel address of BR1. That lets BR2 build a direct shortcut to BR1 with ADVPN (detail in fsd-advpn). With eBGP the hub would put itself as next hop and every packet between spokes would pass through the hub. Plain iBGP between all spokes would need a full mesh, which you do not want, so the hub reflects.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="diagram"><rect x="240" y="20" width="160" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT AS 65000</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="11">route reflector</text><rect x="30" y="170" width="150" height="55" rx="10" fill="#bae6fd"/><text x="105" y="195" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><text x="105" y="212" text-anchor="middle" class="svg-muted" font-size="11">10.1.1.0/24</text><rect x="460" y="170" width="150" height="55" rx="10" fill="#bae6fd"/><text x="535" y="195" text-anchor="middle" class="svg-ink" font-size="13">BR2-FGT</text><text x="535" y="212" text-anchor="middle" class="svg-muted" font-size="11">10.1.2.0/24</text><line x1="270" y1="80" x2="125" y2="170" stroke="#16a34a" stroke-width="2"/><line x1="290" y1="80" x2="150" y2="170" stroke="#d97706" stroke-width="2"/><line x1="370" y1="80" x2="515" y2="170" stroke="#16a34a" stroke-width="2"/><line x1="350" y1="80" x2="490" y2="170" stroke="#d97706" stroke-width="2"/><text x="160" y="110" text-anchor="middle" class="svg-muted" font-size="11">VPN1 169.254.16.0/24</text><text x="480" y="110" text-anchor="middle" class="svg-muted" font-size="11">VPN2 169.254.17.0/24</text><text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="11">Green: BGP session over HUB1-VPN1. Orange: BGP session over HUB1-VPN2.</text></svg><p class="cap">Each spoke has one BGP session per overlay tunnel to the hub. The hub reflects spoke prefixes between spokes.</p></div>
<h3>neighbor-group and neighbor-range: dial-up friendly peering</h3>
<p>Spokes of a dial-up hub appear with addresses that the hub does not know in advance. Typing a neighbor for each of 300 branches would defeat the purpose. FortiOS offers two objects: a <b>neighbor-group</b> is a template of neighbor settings (remote AS, route reflector client, route maps, soft reconfiguration), and a <b>neighbor-range</b> says: "any address in this prefix may become a neighbor using this group". In the Fortinet reference configuration the prefix is the range of tunnel addresses that the hub hands out to the spokes with mode-config (chapter 4 of fsd-ipsec), so a new spoke gets its address, connects, and the BGP session forms by itself.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT: route reflector for both overlays</span>
config router bgp
    set as 65000
    set router-id 10.255.255.1
    set ibgp-multipath enable
    config neighbor-group
        edit "SPOKES-VPN1"
            set remote-as 65000
            set soft-reconfiguration enable
            set route-reflector-client enable
            set advertisement-interval 1
        next
        edit "SPOKES-VPN2"
            set remote-as 65000
            set soft-reconfiguration enable
            set route-reflector-client enable
            set advertisement-interval 1
        next
    end
    config neighbor-range
        edit 1
            set prefix 169.254.16.0 255.255.255.0
            set neighbor-group "SPOKES-VPN1"
        next
        edit 2
            set prefix 169.254.17.0 255.255.255.0
            set neighbor-group "SPOKES-VPN2"
        next
    end
    config network
        edit 1
            set prefix 10.10.0.0 255.255.0.0
        next
    end
end</pre>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: one session per tunnel to the hub tunnel address</span>
config router bgp
    set as 65000
    set router-id 10.255.255.11
    set ibgp-multipath enable
    config neighbor
        edit "169.254.16.1"
            set interface "HUB1-VPN1"
            set remote-as 65000
            set soft-reconfiguration enable
        next
        edit "169.254.17.1"
            set interface "HUB1-VPN2"
            set remote-as 65000
            set soft-reconfiguration enable
        next
    end
    config network
        edit 1
            set prefix 10.1.1.0 255.255.255.0
        next
    end
end</pre>
<p>Notes on the options. <code>ibgp-multipath enable</code> lets the router install more than one iBGP path, so the table holds both tunnels as ECMP next hops and SD-WAN can choose. <code>soft-reconfiguration</code> keeps the received routes so that you can inspect them and re-apply policy without resetting a session. <code>advertisement-interval 1</code> shortens the default 30 seconds between updates to one second, as Fortinet's own examples do, so that changes spread quickly. Timers and <code>bfd enable</code> on a neighbor give faster failure detection; use them with care on a lossy internet path. The hub's <code>network</code> statement needs a matching route in the table; a connected route or the blackhole summary from nse4-routing provides it.</p>
<h3>Verification</h3>
<pre class="out"><span class="c">! Reference configuration (not run in the simulator). Illustrative output, values chosen for teaching.</span>
HUB1-FGT # get router info bgp summary
VRF 0 BGP router identifier 10.255.255.1, local AS number 65000
BGP table version is 8

Neighbor        V         AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
169.254.16.10   4      65000      52      49        8    0    0 00:21:07        1
169.254.16.11   4      65000      50      49        8    0    0 00:20:31        1
<span class="hl">169.254.17.10   4      65000      51      48        8    0    0 00:21:05        1</span>
169.254.17.11   4      65000      49      47        8    0    0 00:20:29        1

Total number of neighbors 4</pre>
<p>Read the last column: a number means the session is <b>Established</b> and shows how many prefixes were received; a word such as Active or Idle means the session is not up. Four sessions on the hub are the two spokes times two tunnels.</p>
<div class="warn"><p><b>Common mistake.</b> Forgetting <code>route-reflector-client enable</code> on the hub. The sessions are Established, the hub learns 10.1.1.0/24 and 10.1.2.0/24, but BR1 never receives the BR2 prefix because iBGP does not pass iBGP routes on. The spokes can reach the data centre but not each other.</p></div>
<div class="exam"><p><b>Exam trap.</b> iBGP needs a full mesh or route reflectors; the neighbor-range prefix must contain the addresses the spokes use as BGP source, otherwise the hub ignores the connection.</p></div>
<div class="scn"><h4>The branch that could see HQ but not its sister branch</h4><p>Two new branches came up and both reached the data centre. Pings between their LANs failed. On the hub the BGP table showed both prefixes, but the neighbor-group had been copied from a template without route-reflector-client. Enabling it on both groups made the hub reflect, the spokes learned each other's prefixes, and the traffic worked (through the hub at first, directly after ADVPN was added).</p><p><b>Lesson:</b> An iBGP hub with several spokes is a route reflector; check that first when spokes cannot see each other.</p></div>
<div class="iv"><p class="q">"Why iBGP with route reflection on an SD-WAN hub?"</p><p>iBGP keeps the original next hop, so a spoke can build an ADVPN shortcut straight to the other spoke. One AS number for the whole overlay keeps spoke configuration identical, and neighbor-group plus neighbor-range let new spokes connect without touching the hub. The cost is that iBGP is not passed between iBGP peers, so the hub must be a route reflector, and iBGP distance 200 means static routes can override it.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>BGP over the overlay scales better than static routes; iBGP with the hub as route reflector is the usual Fortinet design.</li><li>neighbor-group is the template, neighbor-range is the allowed address prefix for dial-up spokes.</li><li>ibgp-multipath installs several paths so SD-WAN can choose between tunnels.</li><li>Use get router info bgp summary: a number in the last column means Established.</li></ul></div>
`,hi:`
<p>Teen branches ho to static routes chal jaate hain. Teen sau ho to nahi chalte: har naye branch ke liye har hub aur har doosre branch par route chahiye hoga. <b>BGP</b> yeh solve karta hai. Har spoke apna LAN hub ko advertise karta hai, hub prefixes aage deta hai, aur naye branch ko sirf apni chhoti si configuration chahiye. Is chapter mein hum BGP ko <b>overlay tunnels par</b> chalate hain aur <b>tunnel addresses</b> par peering karte hain (sabse simple design). Loopbacks par peering agle chapter mein hai.</p>
<h3>iBGP ya eBGP?</h3>
<table class="cmp"><tr><th></th><th>iBGP (ek AS, jaise 65000)</th><th>eBGP (spokes doosre ASes mein)</th></tr><tr><td>Distance</td><td>200, static route (10) se haar jaata hai</td><td>20</td></tr><tr><td>Loop prevention</td><td>Split horizon: iBGP routes doosre iBGP peers ko nahi diye jaate, isliye hub ko <b>route reflection</b> chahiye</td><td>AS path; har spoke ko apna AS number chahiye ya hub ko as-override use karna padta hai</td></tr><tr><td>Next hop</td><td>Route reflector use badalta nahi</td><td>Har hop par sender ban jaata hai</td></tr><tr><td>Typical use</td><td>ADVPN ke saath Fortinet reference designs</td><td>Jab branches alag teams ke hon, ya provider ko AS separation chahiye</td></tr></table>
<p>Fortinet SD-WAN reference designs aam taur par <b>iBGP aur hub ko route reflector</b> banate hain. Wajah next hop hai: jab spoke BR1 10.1.1.0/24 hub ko advertise karta hai aur hub use BR2 ko reflect karta hai, to next hop BR1 ka tunnel address hi rehta hai. Isse BR2 ADVPN se BR1 tak seedha shortcut bana sakta hai (detail fsd-advpn mein). eBGP mein hub khud ko next hop bana leta aur spokes ke beech har packet hub se guzarta. Saare spokes ke beech plain iBGP ko full mesh chahiye, jo aap nahi chahte, isliye hub reflect karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="diagram"><rect x="240" y="20" width="160" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT AS 65000</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="11">route reflector</text><rect x="30" y="170" width="150" height="55" rx="10" fill="#bae6fd"/><text x="105" y="195" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><text x="105" y="212" text-anchor="middle" class="svg-muted" font-size="11">10.1.1.0/24</text><rect x="460" y="170" width="150" height="55" rx="10" fill="#bae6fd"/><text x="535" y="195" text-anchor="middle" class="svg-ink" font-size="13">BR2-FGT</text><text x="535" y="212" text-anchor="middle" class="svg-muted" font-size="11">10.1.2.0/24</text><line x1="270" y1="80" x2="125" y2="170" stroke="#16a34a" stroke-width="2"/><line x1="290" y1="80" x2="150" y2="170" stroke="#d97706" stroke-width="2"/><line x1="370" y1="80" x2="515" y2="170" stroke="#16a34a" stroke-width="2"/><line x1="350" y1="80" x2="490" y2="170" stroke="#d97706" stroke-width="2"/><text x="160" y="110" text-anchor="middle" class="svg-muted" font-size="11">VPN1 169.254.16.0/24</text><text x="480" y="110" text-anchor="middle" class="svg-muted" font-size="11">VPN2 169.254.17.0/24</text><text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="11">Hara: HUB1-VPN1 par BGP session. Narangi: HUB1-VPN2 par BGP session.</text></svg><p class="cap">Har spoke ke hub tak har overlay tunnel par ek BGP session hota hai. Hub spoke prefixes ko spokes ke beech reflect karta hai.</p></div>
<h3>neighbor-group aur neighbor-range: dial-up ke liye aasan peering</h3>
<p>Dial-up hub ke spokes aise addresses se aate hain jo hub ko pehle se maloom nahi hote. 300 branches ke liye alag neighbor type karna maqsad hi khatam kar deta. FortiOS do objects deta hai: <b>neighbor-group</b> neighbor settings ka template hai (remote AS, route reflector client, route maps, soft reconfiguration), aur <b>neighbor-range</b> kehta hai: "is prefix ka koi bhi address is group ke saath neighbor ban sakta hai". Fortinet reference configuration mein prefix wahi tunnel addresses ki range hai jo hub mode-config se spokes ko deta hai (fsd-ipsec ka chapter 4), isliye naya spoke apna address leta hai, connect hota hai, aur BGP session khud ban jaata hai.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT: route reflector for both overlays</span>
config router bgp
    set as 65000
    set router-id 10.255.255.1
    set ibgp-multipath enable
    config neighbor-group
        edit "SPOKES-VPN1"
            set remote-as 65000
            set soft-reconfiguration enable
            set route-reflector-client enable
            set advertisement-interval 1
        next
        edit "SPOKES-VPN2"
            set remote-as 65000
            set soft-reconfiguration enable
            set route-reflector-client enable
            set advertisement-interval 1
        next
    end
    config neighbor-range
        edit 1
            set prefix 169.254.16.0 255.255.255.0
            set neighbor-group "SPOKES-VPN1"
        next
        edit 2
            set prefix 169.254.17.0 255.255.255.0
            set neighbor-group "SPOKES-VPN2"
        next
    end
    config network
        edit 1
            set prefix 10.10.0.0 255.255.0.0
        next
    end
end</pre>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: one session per tunnel to the hub tunnel address</span>
config router bgp
    set as 65000
    set router-id 10.255.255.11
    set ibgp-multipath enable
    config neighbor
        edit "169.254.16.1"
            set interface "HUB1-VPN1"
            set remote-as 65000
            set soft-reconfiguration enable
        next
        edit "169.254.17.1"
            set interface "HUB1-VPN2"
            set remote-as 65000
            set soft-reconfiguration enable
        next
    end
    config network
        edit 1
            set prefix 10.1.1.0 255.255.255.0
        next
    end
end</pre>
<p>Options par notes. <code>ibgp-multipath enable</code> router ko ek se zyada iBGP path install karne deta hai, isliye table mein dono tunnels ECMP next hops ki tarah hote hain aur SD-WAN chun sakta hai. <code>soft-reconfiguration</code> received routes ko rakhta hai taaki aap session reset kiye bina unhe dekh sako aur policy dobara lagu kar sako. <code>advertisement-interval 1</code> updates ke beech ke default 30 seconds ko ek second kar deta hai, jaise Fortinet ke apne examples mein hai, taaki changes jaldi fail jaaye. Timers aur neighbor par <code>bfd enable</code> failure detection tez karte hain; lossy internet path par dhyan se use karo. Hub ke <code>network</code> statement ko table mein matching route chahiye; connected route ya nse4-routing ka blackhole summary woh deta hai.</p>
<h3>Verification</h3>
<pre class="out"><span class="c">! Reference configuration (not run in the simulator). Illustrative output, values chosen for teaching.</span>
HUB1-FGT # get router info bgp summary
VRF 0 BGP router identifier 10.255.255.1, local AS number 65000
BGP table version is 8

Neighbor        V         AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
169.254.16.10   4      65000      52      49        8    0    0 00:21:07        1
169.254.16.11   4      65000      50      49        8    0    0 00:20:31        1
<span class="hl">169.254.17.10   4      65000      51      48        8    0    0 00:21:05        1</span>
169.254.17.11   4      65000      49      47        8    0    0 00:20:29        1

Total number of neighbors 4</pre>
<p>Aakhri column padho: number ka matlab session <b>Established</b> hai aur kitne prefixes mile yeh dikhata hai; Active ya Idle jaisa shabd matlab session up nahi hai. Hub par chaar sessions do spokes ka do tunnels se guna hai.</p>
<div class="warn"><p><b>Common galti.</b> Hub par <code>route-reflector-client enable</code> bhool jaana. Sessions Established hain, hub 10.1.1.0/24 aur 10.1.2.0/24 seekhta hai, lekin BR1 ko BR2 ka prefix kabhi nahi milta kyunki iBGP iBGP routes ko aage nahi deta. Spokes data centre tak pahunchte hain lekin ek-dusre tak nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> iBGP ko full mesh ya route reflectors chahiye; neighbor-range prefix mein woh addresses hone chahiye jo spokes BGP source ki tarah use karte hain, warna hub connection ignore karta hai.</p></div>
<div class="scn"><h4>Branch jo HQ dekhta tha lekin sister branch nahi</h4><p>Do naye branches up hue aur dono data centre tak pahunche. Unke LANs ke beech ping fail hui. Hub par BGP table mein dono prefixes the, lekin neighbor-group ek template se copy hua tha jisme route-reflector-client nahi tha. Dono groups par enable karne se hub reflect karne laga, spokes ne ek-dusre ke prefixes seekhe, aur traffic chala (pehle hub se, ADVPN judne ke baad seedha).</p><p><b>Seekh:</b> Kai spokes wala iBGP hub route reflector hota hai; spokes ek-dusre ko na dekhen to pehle yeh check karo.</p></div>
<div class="iv"><p class="q">"SD-WAN hub par route reflection ke saath iBGP kyun?"</p><p>iBGP original next hop rakhta hai, isliye spoke doosre spoke tak seedha ADVPN shortcut bana sakta hai. Poore overlay ke liye ek AS number spoke configuration ko identical rakhta hai, aur neighbor-group plus neighbor-range naye spokes ko hub chhue bina connect hone dete hain. Keemat yeh hai ki iBGP iBGP peers ke beech pass nahi hota, isliye hub ko route reflector hona padta hai, aur iBGP distance 200 ka matlab static routes use override kar sakte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Overlay par BGP static routes se behtar scale karta hai; hub route reflector ke saath iBGP usual Fortinet design hai.</li><li>neighbor-group template hai, neighbor-range dial-up spokes ke liye allowed address prefix hai.</li><li>ibgp-multipath kai paths install karta hai taaki SD-WAN tunnels ke beech chun sake.</li><li>get router info bgp summary use karo: aakhri column mein number matlab Established.</li></ul></div>
`}};export{e as default};