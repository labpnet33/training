var e=(e,t,n,r,i,a,o)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="8" fill="`+i+`"/><text x="`+(e+n/2)+`" y="`+(t+r/2+(o?-2:4))+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`+(o?`<text x="`+(e+n/2)+`" y="`+(t+r/2+13)+`" text-anchor="middle" class="svg-muted" font-size="11">`+o+`</text>`:``),t=(e,t,n,r)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"/>`,n=(e,t,n)=>`<text x="`+e+`" y="`+t+`" text-anchor="middle" class="svg-accent" font-size="11">`+n+`</text>`,r=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="diagram">`+t+`</svg><p class="cap">`+n+`</p></div>`,i=i=>r(170,e(10,50,150,60,`#fecaca`,`DEAD`,i[0])+e(245,50,150,60,`#fde68a`,`OUT OF SLA`,i[1])+e(480,50,150,60,`#bbf7d0`,`IN SLA`,i[2])+t(160,70,245,70)+t(395,70,480,70)+t(245,95,160,95)+t(480,95,395,95)+n(202,62,i[3])+n(437,62,i[4])+n(202,112,i[5])+n(437,112,i[6])+`<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">`+i[7]+`</text>`,i[8]),a={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This chapter gathers the module into a checklist, a glossary, the most-tested facts and a command cheat-sheet. Health checks, probes, timers, SLA targets and the diagnose views run in the two simulator labs of this module; passive measurement, SLA log periods and overlay monitoring are reference-only, and outputs shown are illustrative.</p>
`+i([`no answers`,`alive, misses`,`alive, meets`,`recovery`,`SLA met`,`failtime`,`SLA missed`,`A member is in exactly one of three states per SLA target.`,`The three states of a member and what moves it between them.`])+`
<h3>Can-do checklist</h3>
<ul><li>Choose a probe protocol and a server for a branch, and justify them (reachable through every member, stable, representative).</li><li>List the protocols: ping, tcp-echo, udp-echo, h&#116;tp, h&#116;tps, dns, tcp-connect, twamp, ftp.</li><li>Calculate detection time (interval x failtime) and recovery time (interval x recoverytime), and explain flapping.</li><li>Write a health check with two SLA targets, set all thresholds, and read the SLA map.</li><li>Enable SLA fail and pass logging and explain what the logs are for.</li><li>Explain the built-in Default health checks and why you review them.</li><li>Explain active, passive and prefer-passive detection, and the policy setting for passive.</li><li>Measure overlay tunnels with a hub loopback and name what makes the probe fail.</li><li>Use the GUI and diagnose commands to monitor, and the four-step workflow to troubleshoot.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Health check / Performance SLA</dt><dd>The probe configuration that measures members.</dd><dt>SLA target</dt><dd>A numbered set of thresholds inside a health check.</dd><dt>SLA map</dt><dd>Bit mask of the SLA targets a member meets.</dd><dt>failtime / recoverytime</dt><dd>Lost or good probes in a row needed to change state.</dd><dt>probe-timeout</dt><dd>Time before a probe counts as lost.</dd><dt>detect-mode</dt><dd>active, passive or prefer-passive.</dd><dt>link-cost-factor</dt><dd>Which measurements rank members.</dd><dt>MOS</dt><dd>Mean opinion score, an estimate of voice quality.</dd><dt>Hub loopback</dt><dd>A /32 address on the hub that answers overlay probes.</dd></dl>
<h3>Most-tested facts</h3>
<ul><li>Detection time is about interval x failtime; defaults for recent releases are interval 500 ms and failtime 5, recoverytime 5 (verify on your unit).</li><li>All thresholds of an SLA target must pass together; set them explicitly.</li><li>A member can be alive and still out of SLA; dead means failtime lost probes.</li><li>The same link shows different latency with different protocols.</li><li>Passive measurement cannot detect a dead link by itself and disables hardware acceleration for measured traffic; it needs the policy setting.</li><li>BGP default hold time is 180 s; SD-WAN health checks decide path choice in seconds.</li><li>Rules refer to a health check and an SLA id.</li></ul>
<h3>Starting values (tune with data)</h3>
<table class="cmp"><tr><th>Traffic</th><th>latency / jitter / loss</th><th>Timers (critical path)</th></tr>
<tr><td>Voice and video</td><td>150 ms / 30 ms / 1 percent</td><td>interval 500, failtime 3, recoverytime 10</td></tr>
<tr><td>Interactive SaaS</td><td>250 ms / 100 ms / 3 percent</td><td>interval 1000, failtime 5, recoverytime 10</td></tr>
<tr><td>Bulk and backup</td><td>no SLA or 500 ms / none / 5 percent</td><td>interval 5000, failtime 3</td></tr></table>
<h3>Command cheat-sheet (reference)</h3>
<pre class="code">! Reference configuration (not run in the simulator)
config system sdwan
    config health-check
        edit "HUB1-PING"
            set server "10.255.0.1"
            set protocol ping
            set interval 500
            set failtime 3
            set recoverytime 10
            set sla-fail-log-period 10
            set members 3 4
            config sla
                edit 1
                    set latency-threshold 150
                    set jitter-threshold 30
                    set packetloss-threshold 1
                next
            end
        next
    end
end
show system sdwan
diagnose sys sdwan health-check
diagnose sys sdwan sla-log &lt;health-check&gt; &lt;member-id&gt;
diagnose sys sdwan intf-sla-log &lt;interface&gt;
diagnose sys sdwan member
diagnose sys sdwan zone
diagnose sniffer packet &lt;interface&gt; 'host &lt;server&gt;' 4 0 l</pre>
<h3>Where to practise</h3>
<p>Repeat the two labs of this module (fast and tolerant probes, and the flapping member) until they are easy, then strengthen the pieces underneath: the sniffer and debug flow in <b>nse4-diag</b>, the routing table and floating routes in <b>nse4-routing</b>, tracking and policy routing in <b>enarsi-pbr-vrf-bfd</b> (the closest relative of SLA tracking), and BGP timers and BFD in <b>enarsi-bgp</b>.</p>
<div class="warn"><p><b>Common mistake.</b> Memorising defaults without checking your release. Defaults and protocol lists change; the exam can phrase answers in terms of behaviour (for example detection time) rather than a number.</p></div>
<div class="exam"><p><b>Exam trap.</b> If an answer says "set failtime to 1 for fastest failover" without mentioning flapping, or "use ping for everything", be suspicious. Good answers balance speed, stability and proof of the real service.</p></div>
<div class="scn"><h4>The one-page health-check standard</h4><p>A managed-service provider wrote a one-page standard: probe the hub loopback for overlays and a public resolver plus the customer's SaaS endpoint for underlays; voice timers 500/3/10; SLA targets 150/30/1 and 250/100/3; logs 10 and 300 seconds; Default checks removed. Every new branch used it through a template, and incident tickets about "mystery failovers" dropped by two thirds in a quarter.</p><p><b>Lesson:</b> A small, written standard beats a hundred ad hoc checks.</p></div>
<div class="iv"><p class="q">"Describe how you would design the performance SLAs for a new branch."</p><p>Underlay: a probe to a reliable public service through each ISP, plus one to the SaaS that matters; overlay: a hub loopback per tunnel. Timers tuned to the link's role, thresholds from application needs and baseline data, all three thresholds set, fail and pass logging on, Default checks reviewed, and a monitoring routine to adjust over time.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Measurement design: protocol, server, timers, thresholds, logging, monitoring.</li><li>Three states per target: dead, alive out of SLA, alive in SLA.</li><li>Active for liveness, passive or application-based for real quality.</li><li>Overlay checks use a hub loopback with a return route.</li><li>Troubleshoot in order: configuration, probe leaves, reply returns, numbers; then the rule.</li></ul></div>
`,hi:`
<p>Yeh chapter module ko checklist, glossary, sabse zyada tested facts aur command cheat-sheet mein samet-ta hai. Health checks, probes, timers, SLA targets aur diagnose views is module ke do simulator labs mein chalte hain; passive measurement, SLA log periods aur overlay monitoring sirf reference hain, aur dikhaye gaye outputs illustrative hain.</p>
`+i([`jawab nahi`,`alive, miss`,`alive, meet`,`recovery`,`SLA met`,`failtime`,`SLA miss`,`Member har SLA target ke liye teen states mein se ek mein hota hai.`,`Member ke teen states aur kya unke beech move karata hai.`])+`
<h3>Can-do checklist</h3>
<ul><li>Branch ke liye probe protocol aur server chuno, aur unhe justify karo (har member se reachable, stable, representative).</li><li>Protocols list karo: ping, tcp-echo, udp-echo, h&#116;tp, h&#116;tps, dns, tcp-connect, twamp, ftp.</li><li>Detection time (interval x failtime) aur recovery time (interval x recoverytime) calculate karo, aur flapping samjhao.</li><li>Do SLA targets wala health check likho, saare thresholds set karo, aur SLA map padho.</li><li>SLA fail aur pass logging enable karo aur batao logs kis liye hain.</li><li>Built-in Default health checks samjhao aur unhe review kyun karte hain.</li><li>Active, passive aur prefer-passive detection, aur passive ke liye policy setting samjhao.</li><li>Hub loopback se overlay tunnels naapo aur batao probe kya fail karwata hai.</li><li>Monitor karne ke liye GUI aur diagnose commands, aur troubleshoot karne ke liye chaar-step workflow use karo.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Health check / Performance SLA</dt><dd>Probe configuration jo members ko naapti hai.</dd><dt>SLA target</dt><dd>Health check ke andar thresholds ka numbered set.</dd><dt>SLA map</dt><dd>Un SLA targets ka bit mask jo member meet karta hai.</dd><dt>failtime / recoverytime</dt><dd>State badalne ke liye lagataar lost ya achhe probes.</dd><dt>probe-timeout</dt><dd>Probe ko lost maanne se pehle ka samay.</dd><dt>detect-mode</dt><dd>active, passive ya prefer-passive.</dd><dt>link-cost-factor</dt><dd>Kaun se measurements members ko rank karte hain.</dd><dt>MOS</dt><dd>Mean opinion score, voice quality ka estimate.</dd><dt>Hub loopback</dt><dd>Hub par /32 address jo overlay probes ka jawab deta hai.</dd></dl>
<h3>Sabse zyada tested facts</h3>
<ul><li>Detection time lagbhag interval x failtime hota hai; recent releases ke defaults interval 500 ms, failtime 5, recoverytime 5 hain (apni unit par verify karo).</li><li>SLA target ke saare thresholds saath pass hone chahiye; unhe explicitly set karo.</li><li>Member alive hote hue bhi out of SLA ho sakta hai; dead matlab failtime lost probes.</li><li>Ek hi link alag protocols se alag latency dikhati hai.</li><li>Passive measurement akele dead link detect nahi kar sakta aur naape gaye traffic ke liye hardware acceleration disable karta hai; use policy setting chahiye.</li><li>BGP default hold time 180 s hai; SD-WAN health checks path choice seconds mein decide karte hain.</li><li>Rules ek health check aur ek SLA id ko refer karte hain.</li></ul>
<h3>Starting values (data se tune karo)</h3>
<table class="cmp"><tr><th>Traffic</th><th>latency / jitter / loss</th><th>Timers (critical path)</th></tr>
<tr><td>Voice aur video</td><td>150 ms / 30 ms / 1 percent</td><td>interval 500, failtime 3, recoverytime 10</td></tr>
<tr><td>Interactive SaaS</td><td>250 ms / 100 ms / 3 percent</td><td>interval 1000, failtime 5, recoverytime 10</td></tr>
<tr><td>Bulk aur backup</td><td>SLA nahi ya 500 ms / koi nahi / 5 percent</td><td>interval 5000, failtime 3</td></tr></table>
<h3>Command cheat-sheet (reference)</h3>
<pre class="code">! Reference configuration (not run in the simulator)
config system sdwan
    config health-check
        edit "HUB1-PING"
            set server "10.255.0.1"
            set protocol ping
            set interval 500
            set failtime 3
            set recoverytime 10
            set sla-fail-log-period 10
            set members 3 4
            config sla
                edit 1
                    set latency-threshold 150
                    set jitter-threshold 30
                    set packetloss-threshold 1
                next
            end
        next
    end
end
show system sdwan
diagnose sys sdwan health-check
diagnose sys sdwan sla-log &lt;health-check&gt; &lt;member-id&gt;
diagnose sys sdwan intf-sla-log &lt;interface&gt;
diagnose sys sdwan member
diagnose sys sdwan zone
diagnose sniffer packet &lt;interface&gt; 'host &lt;server&gt;' 4 0 l</pre>
<h3>Kahan practise karein</h3>
<p>Is module ke do labs (fast aur tolerant probes, aur flapping member) aasaan hone tak repeat karo, phir neeche ke hisson ko mazboot karo: <b>nse4-diag</b> mein sniffer aur debug flow, <b>nse4-routing</b> mein routing table aur floating routes, <b>enarsi-pbr-vrf-bfd</b> mein tracking aur policy routing (SLA tracking ka sabse kareebi rishtedaar), aur <b>enarsi-bgp</b> mein BGP timers aur BFD.</p>
<div class="warn"><p><b>Common galti.</b> Apna release check kiye bina defaults ratna. Defaults aur protocol lists badalti hain; exam jawab number ke bajaye behaviour ke roop mein (jaise detection time) bhi pooch sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Agar koi jawab flapping ka zikr kiye bina "sabse tez failover ke liye failtime 1 karo" kehta hai, ya "sab kuch ke liye ping use karo", to sandeh karo. Achhe jawab speed, stability aur asli service ke saboot ko santulit karte hain.</p></div>
<div class="scn"><h4>Ek-page health-check standard</h4><p>Ek managed-service provider ne ek-page ka standard likha: overlays ke liye hub loopback aur underlays ke liye public resolver plus customer ka SaaS endpoint probe karo; voice timers 500/3/10; SLA targets 150/30/1 aur 250/100/3; logs 10 aur 300 seconds; Default checks hata diye. Har naye branch ne ise template se use kiya, aur "mystery failovers" ke incident tickets ek quarter mein do tihai gir gaye.</p><p><b>Seekh:</b> Chhota, likha hua standard sau ad hoc checks se behtar hai.</p></div>
<div class="iv"><p class="q">"Naye branch ke liye performance SLAs kaise design karoge?"</p><p>Underlay: har ISP ke through ek reliable public service ko probe, plus jo SaaS maayne rakhta hai uske liye ek; overlay: har tunnel ke liye hub loopback. Timers link ke role ke hisaab se tune, thresholds application ki zaroorat aur baseline data se, teeno thresholds set, fail aur pass logging on, Default checks review, aur samay ke saath adjust karne ke liye monitoring routine.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Measurement design: protocol, server, timers, thresholds, logging, monitoring.</li><li>Har target ke teen states: dead, alive out of SLA, alive in SLA.</li><li>Liveness ke liye active, real quality ke liye passive ya application-based.</li><li>Overlay checks return route wala hub loopback use karte hain.</li><li>Order mein troubleshoot karo: configuration, probe nikalta hai, reply wapas aata hai, numbers; phir rule.</li></ul></div>
`}};export{a as default};