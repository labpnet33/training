var e=(e,t,n,r,i,a,o)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="8" fill="`+i+`"/><text x="`+(e+n/2)+`" y="`+(t+r/2+(o?-2:4))+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`+(o?`<text x="`+(e+n/2)+`" y="`+(t+r/2+13)+`" text-anchor="middle" class="svg-muted" font-size="11">`+o+`</text>`:``),t=(e,t,n,r,i)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="`+(i||`#64748b`)+`" stroke-width="2"/>`,n=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="diagram">`+t+`</svg><p class="cap">`+n+`</p></div>`,r=r=>n(215,e(10,70,140,70,`#bae6fd`,`BR1-FGT`,r[0])+e(480,70,150,70,`#ddd6fe`,`HQ-FGT`,r[1])+t(150,90,480,90)+t(150,120,480,120)+`<text x="315" y="82" text-anchor="middle" class="svg-ink" font-size="12">`+r[2]+`</text><text x="315" y="138" text-anchor="middle" class="svg-ink" font-size="12">`+r[3]+`</text><text x="315" y="30" text-anchor="middle" class="svg-accent" font-size="12">`+r[4]+`</text><text x="315" y="52" text-anchor="middle" class="svg-muted" font-size="12">`+r[5]+`</text>`+e(160,160,320,40,`#fde68a`,r[6]),r[7]),i=`<pre class="code">! Reference configuration (not run in the simulator)
! HQ-FGT (hub): a loopback to answer probes
config system interface
    edit "Loopback0"
        set vdom "root"
        set type loopback
        set ip 10.255.0.1 255.255.255.255
        set allowaccess ping
    next
end
! BR1-FGT (spoke): tunnels as members of an overlay zone
config system sdwan
    config zone
        edit "OVERLAY"
        next
    end
    config members
        edit 3
            set interface "HUB1-ISP1"
            set zone "OVERLAY"
        next
        edit 4
            set interface "HUB1-ISP2"
            set zone "OVERLAY"
        next
    end
    config health-check
        edit "HUB1-PING"
            set server "10.255.0.1"
            set protocol ping
            set source 10.255.1.11
            set members 3 4
            config sla
                edit 1
                    set latency-threshold 100
                    set jitter-threshold 30
                    set packetloss-threshold 1
                next
            end
        next
    end
end</pre>`,a={id:`overlay`,h:{en:`Measuring over the overlay: tunnels, hub probe servers, BGP and ADVPN`,hi:`Overlay par measurement: tunnels, hub probe servers, BGP aur ADVPN`},body:{en:`
<p>Until now we measured the internet links (the underlay). In a Secure SD-WAN the traffic that matters most, branch to data centre and branch to branch, goes through <b>IPsec tunnels</b>. Each tunnel is an interface, so it can be an SD-WAN member and can be measured exactly like a link. But the tunnel brings new questions: what do we probe, who answers, and how does this relate to BGP and to ADVPN shortcuts? Think of a toll road built across two public roads: you measure the toll road, not only the public roads under it.</p>
<h3>Tunnels as members</h3>
<p>A tunnel interface (for example <code>HUB1-ISP1</code>, the tunnel to hub 1 over ISP1) is added as a member, usually into an <b>overlay zone</b> separate from the underlay zone. A tunnel member normally needs no gateway: the tunnel is a point-to-point interface. The health check then lists the tunnel members and probes through each tunnel, so the measurement includes encryption, the underlay path and the hub itself.</p>
`+r([`spoke`,`hub`,`HUB1-ISP1 tunnel`,`HUB1-ISP2 tunnel`,`Probe to 10.255.0.1, reply from the hub loopback`,`one probe per tunnel, every interval`,`underlay: ISP1 and ISP2 carry the tunnels`,`Each tunnel is measured separately, end to end.`])+`
<h3>The hub probe server</h3>
<p>Do not probe a public site through a tunnel; probe the <b>hub</b>. The standard design is a <b>loopback interface</b> on the hub with a /32 address that answers ping. It is stable (it never goes down with a physical port), it is reachable only through the overlay, and it lets every spoke measure its tunnels against one known point. The configuration below shows the hub loopback and a spoke that uses it.</p>
`+i+`
<h3>Three things that must be true</h3>
<ol><li><b>The hub answers.</b> The loopback must allow ping (<code>allowaccess ping</code>). The probe is traffic to the FortiGate itself, so it is controlled by the interface's allowed access, not by a firewall policy.</li><li><b>The reply can return.</b> The hub needs a route back to the probe's source address. By default the source is the tunnel address of the spoke; with <code>set source</code> you choose a specific address such as a spoke loopback. That address must be known to the hub (connected, learned by BGP or added by the VPN) or the reply is lost and the member looks dead.</li><li><b>The probe goes out of the right tunnel.</b> The health check sends one probe through each listed member, so the member list must contain exactly the tunnels you mean.</li></ol>
<div class="eg"><p><b>Worked example: two tunnels, two numbers.</b> BR1 has HUB1-ISP1 over fibre and HUB1-ISP2 over LTE. The health check shows HUB1-ISP1 at 22 ms, 2 ms jitter, 0 percent loss and HUB1-ISP2 at 48 ms, 12 ms jitter, 0.5 percent loss. With SLA 1 (100 ms, 30 ms, 1 percent) both pass; a voice rule that prefers the lowest latency picks the fibre tunnel. If fibre then climbs to 4 percent loss, SLA 1 fails on HUB1-ISP1 and new calls go over LTE within a few probe intervals.</p></div>
<h3>One hub or two: separate checks</h3>
<p>With two hubs, make a health check per hub (<code>HUB1-PING</code> towards hub 1's loopback with the hub 1 tunnels, <code>HUB2-PING</code> towards hub 2). A tunnel to hub 1 being healthy says nothing about hub 2. Rules then choose among members using the check of the hub they target.</p>
<h3>What the loopback does not prove</h3>
<p>Pinging the hub proves the tunnel and the hub are alive; it does not prove that the hub's own internet exit or the data-centre application is healthy. For traffic that leaves via the hub, add a second check towards something behind the hub (a data-centre server, or an internet target seen through the hub).</p>
<h3>Health checks and BGP</h3>
<p>BGP over the tunnels distributes routes, but it is a <b>slow</b> detector. Default BGP timers are keepalive 60 seconds and hold time 180 seconds, so BGP can keep a route to a dead tunnel for up to three minutes unless you add BFD. SD-WAN probes at 500 ms to a few seconds decide path <b>choice</b> far faster. The division of labour: <b>BGP provides reachability and policy, SD-WAN health checks provide fast quality-based choice.</b> Newer releases add ways to connect the two, for example letting an SLA result influence the route preference advertised by BGP, and treating a BGP neighbour as an SD-WAN object. The syntax differs by release, so I describe it only in words here; the routing module <b>fsd-routing</b> covers it.</p>
<table class="cmp"><tr><th>Detector</th><th>Typical speed</th><th>Decides</th></tr>
<tr><td>Interface or IKE down</td><td>Seconds</td><td>Tunnel gone</td></tr>
<tr><td>SD-WAN health check</td><td>1.5 to 10 s with sensible timers</td><td>Which member a session uses</td></tr>
<tr><td>BFD</td><td>Sub-second to seconds</td><td>Whether a BGP or OSPF neighbour is up</td></tr>
<tr><td>BGP default hold timer</td><td>Up to 180 s</td><td>Whether a BGP route stays</td></tr></table>
<h3>Health checks and ADVPN shortcuts</h3>
<p>ADVPN builds <b>shortcut tunnels</b> between spokes on demand. They are short-lived, so their health data starts fresh each time. As a rule: keep a health check on the <b>parent overlays</b> (the tunnels to the hub) so the spoke always has a baseline, and learn in <b>fsd-advpn</b> how shortcut tunnels are measured and how the rule setting <code>use-shortcut-sla</code> (check the name on your release) decides whether the shortcut's own measurement or the parent's is used when comparing quality.</p>
<div class="warn"><p><b>Common mistake.</b> Probing a hub address that is only reachable <i>through</i> the tunnel from a health check that lists underlay members, or the reverse. The check's member list and the server must match the path you want to measure.</p></div>
<div class="exam"><p><b>Exam trap.</b> A health check on tunnel members probes through the tunnel, so the hub must answer and have a return route to the probe source. A dead return route makes a healthy tunnel look dead. Remember also that BGP timers are slower than SD-WAN health checks.</p></div>
<div class="scn"><h4>Dead tunnels that were fine</h4><p>After a spoke template rollout, every overlay member on 30 spokes showed dead although traffic passed. The health check used <code>set source</code> with a spoke loopback that was not advertised to the hub, so probe replies had no route back. Advertising the loopbacks in BGP fixed it in minutes; the team added a template check that every source address is announced.</p><p><b>Lesson:</b> If a probe is answered but never returns, the member looks dead; check the return route first.</p></div>
<div class="iv"><p class="q">"How do you monitor overlay tunnel quality in SD-WAN?"</p><p>I add the tunnels as members of an overlay zone and probe a loopback on the hub through each tunnel, with SLA thresholds suited to the traffic. I make sure the loopback allows ping and the hub can route back to the probe source, use one check per hub, and rely on SD-WAN for fast path choice while BGP provides reachability.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Tunnels are SD-WAN members, ideally in an overlay zone, and are measured like links.</li><li>Probe a stable hub loopback; allow ping on it and ensure a return route to the probe source.</li><li>One health check per hub; the loopback does not prove the hub's internet exit.</li><li>BGP timers are slow (hold up to 180 s); SD-WAN decides path choice in seconds.</li><li>Keep a baseline check on the parent overlays; ADVPN shortcut measurement is covered in fsd-advpn.</li></ul></div>
`,hi:`
<p>Ab tak humne internet links (underlay) naape. Secure SD-WAN mein sabse zaroori traffic, branch se data centre aur branch se branch, <b>IPsec tunnels</b> se guzarta hai. Har tunnel ek interface hai, isliye woh SD-WAN member ban sakta hai aur bilkul links ki tarah naapa ja sakta hai. Par tunnel naye sawal laata hai: hum kya probe karein, jawab kaun de, aur yeh BGP aur ADVPN shortcuts se kaise judta hai? Do public roads ke upar bani toll road socho: aap toll road naapte ho, sirf neeche ki public roads nahi.</p>
<h3>Tunnels members ki tarah</h3>
<p>Tunnel interface (jaise <code>HUB1-ISP1</code>, ISP1 par hub 1 tak tunnel) member ki tarah jodta hai, aam taur par underlay zone se alag <b>overlay zone</b> mein. Tunnel member ko aam taur par gateway nahi chahiye: tunnel point-to-point interface hai. Health check phir tunnel members list karta hai aur har tunnel ke through probe karta hai, isliye measurement mein encryption, underlay path aur hub khud shamil hote hain.</p>
`+r([`spoke`,`hub`,`HUB1-ISP1 tunnel`,`HUB1-ISP2 tunnel`,`Probe 10.255.0.1 ko, jawab hub loopback se`,`har tunnel ke liye ek probe, har interval`,`underlay: ISP1 aur ISP2 tunnels uthate hain`,`Har tunnel alag naapa jaata hai, end to end.`])+`
<h3>Hub probe server</h3>
<p>Tunnel ke through public site probe mat karo; <b>hub</b> ko probe karo. Standard design hai hub par /32 address wala <b>loopback interface</b> jo ping ka jawab deta hai. Woh stable hai (physical port ke saath kabhi down nahi hota), sirf overlay se reachable hai, aur har spoke ko apne tunnels ek jaane-pehchaane point ke against naapne deta hai. Neeche ki configuration hub loopback aur use use karne wala spoke dikhati hai.</p>
`+i+`
<h3>Teen cheezein sach honi chahiye</h3>
<ol><li><b>Hub jawab de.</b> Loopback ko ping allow karni chahiye (<code>allowaccess ping</code>). Probe FortiGate khud ke liye traffic hai, isliye woh interface ke allowed access se control hota hai, firewall policy se nahi.</li><li><b>Jawab wapas aa sake.</b> Hub ko probe ke source address tak route chahiye. Default source spoke ka tunnel address hota hai; <code>set source</code> se aap spoke loopback jaisa khaas address chun sakte ho. Woh address hub ko maloom hona chahiye (connected, BGP se seekha hua ya VPN se joda gaya) warna jawab kho jaata hai aur member dead dikhta hai.</li><li><b>Probe sahi tunnel se bahar jaaye.</b> Health check har listed member se ek probe bhejta hai, isliye member list mein bilkul wahi tunnels hone chahiye jo aap chahte ho.</li></ol>
<div class="eg"><p><b>Worked example: do tunnels, do numbers.</b> BR1 ke paas fibre par HUB1-ISP1 aur LTE par HUB1-ISP2 hai. Health check HUB1-ISP1 ko 22 ms, 2 ms jitter, 0 percent loss aur HUB1-ISP2 ko 48 ms, 12 ms jitter, 0.5 percent loss dikhata hai. SLA 1 (100 ms, 30 ms, 1 percent) ke saath dono pass hote hain; lowest latency prefer karne wala voice rule fibre tunnel chunta hai. Agar fibre phir 4 percent loss tak pahunche, to HUB1-ISP1 par SLA 1 fail hota hai aur naye calls kuch probe intervals mein LTE par chale jaate hain.</p></div>
<h3>Ek hub ya do: alag checks</h3>
<p>Do hubs ke saath har hub ke liye ek health check banao (<code>HUB1-PING</code> hub 1 ke loopback ki taraf hub 1 tunnels ke saath, <code>HUB2-PING</code> hub 2 ki taraf). Hub 1 ka tunnel healthy hona hub 2 ke baare mein kuch nahi batata. Rules phir us hub ke check se members chunte hain jise woh target karte hain.</p>
<h3>Loopback kya prove nahi karta</h3>
<p>Hub ko ping karna prove karta hai ki tunnel aur hub alive hain; yeh prove nahi karta ki hub ka apna internet exit ya data-centre application healthy hai. Jo traffic hub se bahar jaata hai uske liye hub ke peeche kisi cheez ki taraf doosra check jodo (data-centre server, ya hub ke through dikhta internet target).</p>
<h3>Health checks aur BGP</h3>
<p>Tunnels par BGP routes distribute karta hai, lekin woh <b>dheema</b> detector hai. Default BGP timers keepalive 60 seconds aur hold time 180 seconds hain, isliye BFD na jodo to BGP dead tunnel ka route teen minute tak rakh sakta hai. 500 ms se kuch seconds par probe karne wale SD-WAN probes path <b>choice</b> kaafi tezi se decide karte hain. Kaam ka batwara: <b>BGP reachability aur policy deta hai, SD-WAN health checks tez quality-based choice deti hain.</b> Naye releases dono ko jodne ke tareeke jodte hain, jaise SLA result ko BGP se advertise hone wali route preference ko prabhavit karne dena, aur BGP neighbour ko SD-WAN object ki tarah treat karna. Syntax release ke hisaab se alag hai, isliye main yahan use sirf shabdon mein describe karta hoon; routing module <b>fsd-routing</b> ise cover karta hai.</p>
<table class="cmp"><tr><th>Detector</th><th>Typical speed</th><th>Kya decide karta hai</th></tr>
<tr><td>Interface ya IKE down</td><td>Seconds</td><td>Tunnel gaya</td></tr>
<tr><td>SD-WAN health check</td><td>Samajhdaar timers ke saath 1.5 se 10 s</td><td>Session kaun sa member use kare</td></tr>
<tr><td>BFD</td><td>Sub-second se seconds</td><td>BGP ya OSPF neighbour up hai ya nahi</td></tr>
<tr><td>BGP default hold timer</td><td>180 s tak</td><td>BGP route rehta hai ya nahi</td></tr></table>
<h3>Health checks aur ADVPN shortcuts</h3>
<p>ADVPN spokes ke beech demand par <b>shortcut tunnels</b> banata hai. Woh kam umr ke hote hain, isliye unka health data har baar naya shuru hota hai. Niyam: <b>parent overlays</b> (hub tak tunnels) par health check rakho taaki spoke ke paas hamesha baseline ho, aur <b>fsd-advpn</b> mein seekho ki shortcut tunnels kaise naape jaate hain aur rule setting <code>use-shortcut-sla</code> (naam apne release par check karo) kaise tay karti hai ki quality compare karte waqt shortcut ka apna measurement use ho ya parent ka.</p>
<div class="warn"><p><b>Common galti.</b> Aisa hub address probe karna jo sirf tunnel <i>ke through</i> reachable hai, par health check underlay members list karta ho, ya ulta. Check ki member list aur server us path se mel khane chahiye jise aap naapna chahte ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tunnel members par health check tunnel ke through probe karta hai, isliye hub ko jawab dena hoga aur probe source tak return route hona chahiye. Dead return route healthy tunnel ko dead dikhata hai. Yeh bhi yaad rakho ki BGP timers SD-WAN health checks se dheemi hain.</p></div>
<div class="scn"><h4>Dead tunnels jo theek the</h4><p>Spoke template rollout ke baad 30 spokes par har overlay member dead dikha jabki traffic pass ho raha tha. Health check ne <code>set source</code> ke saath aisa spoke loopback use kiya jo hub ko advertise nahi hua tha, isliye probe replies ka return route nahi tha. Loopbacks ko BGP mein advertise karne se minutes mein theek hua; team ne template check jodha ki har source address announce ho.</p><p><b>Seekh:</b> Agar probe ka jawab aata hai par wapas nahi pahunchta, to member dead dikhta hai; pehle return route check karo.</p></div>
<div class="iv"><p class="q">"SD-WAN mein overlay tunnel quality kaise monitor karte ho?"</p><p>Main tunnels ko overlay zone ke members banata hoon aur har tunnel ke through hub ke loopback ko probe karta hoon, traffic ke hisaab ke SLA thresholds ke saath. Main yeh sunishchit karta hoon ki loopback ping allow kare aur hub probe source tak route kar sake, har hub ke liye ek check rakhta hoon, aur tez path choice ke liye SD-WAN par nirbhar hoon jabki BGP reachability deta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Tunnels SD-WAN members hain, behtar hai overlay zone mein, aur links ki tarah naape jaate hain.</li><li>Stable hub loopback probe karo; us par ping allow karo aur probe source tak return route sunishchit karo.</li><li>Har hub ke liye ek health check; loopback hub ka internet exit prove nahi karta.</li><li>BGP timers dheemi hain (hold 180 s tak); SD-WAN path choice seconds mein decide karta hai.</li><li>Parent overlays par baseline check rakho; ADVPN shortcut measurement fsd-advpn mein cover hai.</li></ul></div>
`}};export{a as default};