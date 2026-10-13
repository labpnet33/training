var e=(e,t,n,r,i,a,o)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="8" fill="`+i+`"/><text x="`+(e+n/2)+`" y="`+(t+r/2+(o?-2:4))+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`+(o?`<text x="`+(e+n/2)+`" y="`+(t+r/2+13)+`" text-anchor="middle" class="svg-muted" font-size="11">`+o+`</text>`:``),t=(e,t,n,r)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"/>`,n=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="diagram">`+t+`</svg><p class="cap">`+n+`</p></div>`,r=r=>n(190,e(5,40,98,60,`#bae6fd`,`1 `+r[0],r[1])+e(110,40,98,60,`#bbf7d0`,`2 `+r[2],r[3])+e(215,40,98,60,`#ddd6fe`,`3 `+r[4],r[5])+e(320,40,98,60,`#fde68a`,`4 `+r[6],r[7])+e(425,40,98,60,`#fed7aa`,`5 `+r[8],r[9])+e(530,40,105,60,`#e2e8f0`,`6 `+r[10],r[11])+t(103,70,110,70)+t(208,70,215,70)+t(313,70,320,70)+t(418,70,425,70)+t(523,70,530,70)+`<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">`+r[12]+`</text>`,r[13]),i={id:`first-look`,h:{en:`A first look at Secure SD-WAN on the FortiGate and a first troubleshooting ladder`,hi:`FortiGate par Secure SD-WAN ki pehli jhalak aur pehli troubleshooting ladder`},body:{en:`
<p>You do not need to configure anything to pass this module, but one short look at the real objects makes the vocabulary concrete. This chapter shows the smallest working SD-WAN on <b>BR1-FGT</b> and then the habit that will save you hours in every later module: a fixed <b>troubleshooting ladder</b>. You already know the building blocks from <b>nse4-sdwan</b>; here they are in one screen, with the exam-track names.</p>
<h3>Where to find it in the GUI</h3>
<p>In FortiOS 7.6 open <b>Network &gt; SD-WAN</b>. Its tabs show the <b>SD-WAN Zones</b> (and their members), the <b>Performance SLAs</b> (health checks) and the <b>SD-WAN Rules</b>. The same objects exist in the CLI under <code>config system sdwan</code>. The GUI and the CLI are two views of one configuration; the exam uses both.</p>
<h3>The smallest working SD-WAN</h3>
<pre class="code">! Try it: lab "Two ISPs become one SD-WAN zone"
config system sdwan
    set status enable
    config zone
        edit "virtual-wan-link"
        next
    end
    config members
        edit 1
            set interface "port1"
            set gateway 203.0.113.1
        next
        edit 2
            set interface "port2"
            set gateway 198.51.100.1
        next
    end
    config health-check
        edit "INTERNET-PING"
            set server "192.0.2.53"
            set protocol ping
            set members 1 2
            config sla
                edit 1
                    set latency-threshold 100
                    set jitter-threshold 30
                    set packetloss-threshold 2
                next
            end
        next
    end
end
config router static
    edit 1
        set sdwan-zone "virtual-wan-link"
    next
end</pre>
<p>That is two members, one zone, one health check with one SLA target, and one default route that points at the zone. A zone policy like the one in the previous chapters completes it. The probe address <code>192.0.2.53</code> is a documentation address standing for a reliable internet server.</p>
<h3>What a healthy result looks like (illustrative)</h3>
<p>On a real unit these commands show the state, and the simulator prints the same fields in the labs of <b>nse4-sdwan</b>. The lines below are <b>illustrative</b>: they show the format and the fields to read, not a capture, and the numbers are made up.</p>
<pre class="out">! Try it: lab "Two ISPs become one SD-WAN zone" - illustrative output format
BR1-FGT # diagnose sys sdwan member
Member(1): interface: port1, flags=0x0 , gateway: 203.0.113.1, priority: 0 1024, weight: 0
Member(2): interface: port2, flags=0x0 , gateway: 198.51.100.1, priority: 0 1024, weight: 0

BR1-FGT # diagnose sys sdwan health-check
Health Check(INTERNET-PING):
Seq(1 port1): <span class="hl">state(alive)</span>, <span class="hl">packet-loss(0.000%) latency(11.2), jitter(0.4)</span>, ... sla_map=0x1
Seq(2 port2): <span class="hl">state(alive)</span>, packet-loss(0.000%) latency(31.8), jitter(1.1), ... sla_map=0x1</pre>
<p>Read it like this: both members are <b>alive</b>; both measure loss, latency and jitter; <code>sla_map</code> says which SLA targets each member currently meets (bit 1 set means SLA 1 is met). Exact extra fields differ by release, so do not memorise the tail of the line.</p>
`+r([`Underlay`,`link up, IP, gw`,`Route`,`zone default`,`Policy`,`LAN to zone`,`Measure`,`health check`,`Rules`,`which member`,`Session`,`flow, NAT`,`Work in this order: the lowest step that fails is usually the cause.`,`The six-step troubleshooting ladder for a branch that cannot reach a destination.`])+`
<h3>The troubleshooting ladder</h3>
<table class="cmp"><tr><th>Step</th><th>Question</th><th>Typical tool</th></tr>
<tr><td>1. Underlay</td><td>Is the interface up, does it have an address, can it reach its gateway?</td><td><code>get system interface physical</code>, <code>execute ping</code></td></tr>
<tr><td>2. Route</td><td>Is there a route to the destination, through the zone?</td><td><code>get router info routing-table all</code></td></tr>
<tr><td>3. Policy</td><td>Does a firewall policy allow this traffic into the zone?</td><td><code>diagnose firewall iprope lookup</code> or the debug flow</td></tr>
<tr><td>4. Measure</td><td>Is each member alive, and does it meet the SLA?</td><td><code>diagnose sys sdwan health-check</code></td></tr>
<tr><td>5. Rules</td><td>Which rule matched, and which member did it choose?</td><td><code>diagnose sys sdwan service</code>, <code>diagnose firewall proute list</code></td></tr>
<tr><td>6. Session</td><td>What does the live session say: interface, NAT, policy id?</td><td><code>diagnose sys session list</code>, debug flow</td></tr></table>
<p>The ladder follows the packet's life: wire, route, permission, measurement, steering, session. Later modules add the overlay (tunnels, BGP, ADVPN shortcuts) as extra rungs, but the order stays the same. In <b>nse4-diag</b> you practised the sniffer, the debug flow and the session table; they are the tools of rungs 3 and 6. In <b>nse4-routing</b> you practised rungs 1 and 2.</p>
<div class="warn"><p><b>Common mistake.</b> Jumping straight to SD-WAN rules because "it is an SD-WAN problem". Most branch outages are rung 1 to 3: a cable, a missing zone route, a policy still pointing at the old interface. Climb in order.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam gives symptoms and asks for the next diagnostic step. The correct answer is the command that checks the lowest rung not yet proven, not the most advanced command you know.</p></div>
<div class="scn"><h4>Alive, but the page will not load</h4><p>A branch had two members both showing <b>alive</b>, yet browsing failed. The engineer climbed the ladder: the interfaces were up, the zone default route was present, but the debug flow showed <i>denied by forward policy check</i>. The only policy still named the old WAN port instead of the zone. Pointing the policy at the zone fixed it in a minute; the SD-WAN rules had never been the problem.</p><p><b>Lesson:</b> A healthy measurement does not prove a permitted path; check the policy rung.</p></div>
<div class="iv"><p class="q">"A branch lost internet after the SD-WAN change. How do you start?"</p><p>Start at the bottom: link and gateway, then the zone default route, then the policy to the zone, then health-check state and rules. I would use <code>get router info routing-table all</code>, the debug flow for the policy verdict, and <code>diagnose sys sdwan health-check</code> and <code>service</code> for the measurement and rule layers.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>The smallest SD-WAN is members, a zone, a health check, a zone route and a zone policy.</li><li>GUI: Network &gt; SD-WAN (zones, performance SLAs, rules); CLI: config system sdwan.</li><li>Read health-check output for alive or dead, loss, latency, jitter and sla_map.</li><li>Troubleshoot in a fixed ladder: underlay, route, policy, measure, rules, session.</li></ul></div>
`,hi:`
<p>Is module ko pass karne ke liye aapko kuch configure karne ki zaroorat nahi, lekin asli objects par ek chhoti nazar vocabulary ko thos bana deti hai. Yeh chapter <b>BR1-FGT</b> par sabse chhota working SD-WAN dikhata hai aur phir woh aadat jo aage har module mein ghante bachayegi: ek fixed <b>troubleshooting ladder</b>. Building blocks aap <b>nse4-sdwan</b> se jaante ho; yahan woh ek screen par hain, exam-track ke naamon ke saath.</p>
<h3>GUI mein kahan milta hai</h3>
<p>FortiOS 7.6 mein <b>Network &gt; SD-WAN</b> kholo. Uske tabs <b>SD-WAN Zones</b> (aur unke members), <b>Performance SLAs</b> (health checks) aur <b>SD-WAN Rules</b> dikhate hain. Wahi objects CLI mein <code>config system sdwan</code> ke andar hain. GUI aur CLI ek hi configuration ke do view hain; exam dono use karta hai.</p>
<h3>Sabse chhota working SD-WAN</h3>
<pre class="code">! Try it: lab "Do ISPs ek SD-WAN zone bante hain"
config system sdwan
    set status enable
    config zone
        edit "virtual-wan-link"
        next
    end
    config members
        edit 1
            set interface "port1"
            set gateway 203.0.113.1
        next
        edit 2
            set interface "port2"
            set gateway 198.51.100.1
        next
    end
    config health-check
        edit "INTERNET-PING"
            set server "192.0.2.53"
            set protocol ping
            set members 1 2
            config sla
                edit 1
                    set latency-threshold 100
                    set jitter-threshold 30
                    set packetloss-threshold 2
                next
            end
        next
    end
end
config router static
    edit 1
        set sdwan-zone "virtual-wan-link"
    next
end</pre>
<p>Yeh do members, ek zone, ek SLA target wala ek health check, aur zone ko point karta ek default route hai. Pichhle chapters jaisi zone policy ise poora karti hai. Probe address <code>192.0.2.53</code> documentation address hai jo ek bharosemand internet server ko represent karta hai.</p>
<h3>Healthy result kaisa dikhta hai (illustrative)</h3>
<p>Asli unit par yeh commands state dikhate hain, aur simulator <b>nse4-sdwan</b> ke labs mein wahi fields print karta hai. Neeche ki lines <b>illustrative</b> hain: woh format aur padhne wale fields dikhati hain, capture nahi, aur numbers banaye gaye hain.</p>
<pre class="out">! Try it: lab "Do ISPs ek SD-WAN zone bante hain" - illustrative output format
BR1-FGT # diagnose sys sdwan member
Member(1): interface: port1, flags=0x0 , gateway: 203.0.113.1, priority: 0 1024, weight: 0
Member(2): interface: port2, flags=0x0 , gateway: 198.51.100.1, priority: 0 1024, weight: 0

BR1-FGT # diagnose sys sdwan health-check
Health Check(INTERNET-PING):
Seq(1 port1): <span class="hl">state(alive)</span>, <span class="hl">packet-loss(0.000%) latency(11.2), jitter(0.4)</span>, ... sla_map=0x1
Seq(2 port2): <span class="hl">state(alive)</span>, packet-loss(0.000%) latency(31.8), jitter(1.1), ... sla_map=0x1</pre>
<p>Ise aise padho: dono members <b>alive</b> hain; dono loss, latency aur jitter naapte hain; <code>sla_map</code> batata hai ki har member abhi kaun se SLA targets meet kar raha hai (bit 1 set ka matlab SLA 1 meet hai). Extra fields release ke hisaab se alag hote hain, isliye line ki poonchh yaad mat karo.</p>
`+r([`Underlay`,`link up, IP, gw`,`Route`,`zone default`,`Policy`,`LAN se zone`,`Measure`,`health check`,`Rules`,`kaun sa member`,`Session`,`flow, NAT`,`Is order mein kaam karo: sabse neeche ka fail hota step aam taur par wajah hota hai.`,`Us branch ke liye chhe-step troubleshooting ladder jo destination tak nahi pahunch paati.`])+`
<h3>Troubleshooting ladder</h3>
<table class="cmp"><tr><th>Step</th><th>Sawal</th><th>Typical tool</th></tr>
<tr><td>1. Underlay</td><td>Kya interface up hai, address hai, gateway tak pahunch sakta hai?</td><td><code>get system interface physical</code>, <code>execute ping</code></td></tr>
<tr><td>2. Route</td><td>Kya destination ka route hai, zone ke through?</td><td><code>get router info routing-table all</code></td></tr>
<tr><td>3. Policy</td><td>Kya firewall policy yeh traffic zone mein allow karti hai?</td><td><code>diagnose firewall iprope lookup</code> ya debug flow</td></tr>
<tr><td>4. Measure</td><td>Kya har member alive hai, aur SLA meet karta hai?</td><td><code>diagnose sys sdwan health-check</code></td></tr>
<tr><td>5. Rules</td><td>Kaun sa rule match hua, aur usne kaun sa member chuna?</td><td><code>diagnose sys sdwan service</code>, <code>diagnose firewall proute list</code></td></tr>
<tr><td>6. Session</td><td>Live session kya kehta hai: interface, NAT, policy id?</td><td><code>diagnose sys session list</code>, debug flow</td></tr></table>
<p>Ladder packet ki zindagi follow karti hai: wire, route, permission, measurement, steering, session. Aage ke modules overlay (tunnels, BGP, ADVPN shortcuts) ko extra rungs ki tarah jodte hain, par order wahi rehta hai. <b>nse4-diag</b> mein aapne sniffer, debug flow aur session table practise kiye; woh rung 3 aur 6 ke tools hain. <b>nse4-routing</b> mein aapne rung 1 aur 2 practise kiye.</p>
<div class="warn"><p><b>Common galti.</b> Seedha SD-WAN rules par kood jaana kyunki "yeh SD-WAN ki problem hai". Zyadatar branch outages rung 1 se 3 ke hote hain: cable, zone route missing, ya policy abhi bhi purane interface ko point kar rahi. Order mein chadho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam symptoms deta hai aur agla diagnostic step poochta hai. Sahi jawab woh command hai jo sabse neeche ki us rung ko check kare jo abhi prove nahi hui, sabse advanced command jo aapko aati ho woh nahi.</p></div>
<div class="scn"><h4>Alive hai, par page load nahi hota</h4><p>Ek branch ke do members dono <b>alive</b> dikhate the, phir bhi browsing fail thi. Engineer ne ladder chadhi: interfaces up the, zone default route maujood tha, par debug flow ne <i>denied by forward policy check</i> dikhaya. Ek hi policy abhi bhi zone ki jagah purane WAN port ko naam leti thi. Policy ko zone par point karne se ek minute mein theek hua; SD-WAN rules kabhi problem nahi the.</p><p><b>Seekh:</b> Healthy measurement allowed path prove nahi karta; policy rung check karo.</p></div>
<div class="iv"><p class="q">"SD-WAN change ke baad branch ka internet chala gaya. Kaise shuru karoge?"</p><p>Neeche se shuru: link aur gateway, phir zone default route, phir zone ki policy, phir health-check state aur rules. Main <code>get router info routing-table all</code>, policy verdict ke liye debug flow, aur measurement aur rule layers ke liye <code>diagnose sys sdwan health-check</code> aur <code>service</code> use karunga.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Sabse chhota SD-WAN: members, zone, health check, zone route aur zone policy.</li><li>GUI: Network &gt; SD-WAN (zones, performance SLAs, rules); CLI: config system sdwan.</li><li>Health-check output mein alive ya dead, loss, latency, jitter aur sla_map padho.</li><li>Fixed ladder se troubleshoot karo: underlay, route, policy, measure, rules, session.</li></ul></div>
`}};export{i as default};