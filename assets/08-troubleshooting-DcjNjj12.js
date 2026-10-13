var e=(e,t,n,r,i,a,o)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="8" fill="`+i+`"/><text x="`+(e+n/2)+`" y="`+(t+r/2+(o?-2:4))+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`+(o?`<text x="`+(e+n/2)+`" y="`+(t+r/2+13)+`" text-anchor="middle" class="svg-muted" font-size="11">`+o+`</text>`:``),t=(e,t,n,r)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"/>`,n=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="diagram">`+t+`</svg><p class="cap">`+n+`</p></div>`,r=r=>n(190,e(10,60,110,60,`#bae6fd`,r[0],r[1])+e(150,60,110,60,`#bbf7d0`,r[2],r[3])+e(290,60,110,60,`#bbf7d0`,r[4],r[5])+e(430,60,100,60,`#fed7aa`,r[6],r[7])+e(555,60,80,60,`#ddd6fe`,r[8],r[9])+t(120,90,150,90)+t(260,90,290,90)+t(400,90,430,90)+t(530,90,555,90),r[10]),i={id:`troubleshooting`,h:{en:`Troubleshooting: why did this flow take that member?`,hi:`Troubleshooting: is flow ne woh member kyun liya?`},body:{en:`
<p>The classic ticket is "this application uses the wrong link". Do not guess. Walk the decision in the same order the FortiGate does: policy, rule match, member state, selection, session. Each step has one command.</p>
<h3>Step 1: is the traffic allowed and routable at all?</h3>
<p>A rule does not permit traffic. Confirm a firewall policy matches and that a route exists, for example with <code>get router info routing-table all</code>. If the policy is wrong, nothing in the rules matters.</p>
<h3>Step 2: which rule did the session match?</h3>
<p>Look at the rule list with hit counters in the GUI, or list the policy-route entries the kernel built with <code>diagnose firewall proute list</code>. A rule with zero hits, above one with many, is the usual culprit. For one live session use the session table or the debug flow output: it shows the policy-route decision for the first packet.</p>
<h3>Step 3: what does the engine think of each member?</h3>
<p>The service view shows the rule's mode, its members and the current selection:</p>
<pre class="out"># Try it: lab "The voice rule with zero hits" - illustrative output format, shortened
HQ-FGT # diagnose sys sdwan service4
Service(2): Address Mode(IPV4) ... Mode(priority), link-cost-factor(jitter)
  Members(2):
    1: Seq_num(3 HQ-T1), alive, jitter: 1.2, selected
    2: Seq_num(4 HQ-T2), alive, jitter: 24.8
  Dst address(1):
        198.51.100.0-198.51.100.255</pre>
<p>I am confident of the general shape: the rule, its members with state and metric, and a marker on the selected ones, but field names and extra flags change between builds. Read what your own device prints. Use <code>diagnose sys sdwan member</code> and <code>diagnose sys sdwan health-check</code> (from fsd-sla) to check state and SLA status beside it. If a member is not <i>alive</i> or fails the SLA, the rule will not choose it.</p>
<h3>Step 4: is a classification problem in the way?</h3>
<p>For application or ISDB rules, check that the ISDB is current in FortiGuard status and that the application cache holds the destination (<code>diagnose sys sdwan internet-service-app-ctrl-list</code>). Remember chapter 5: the first session may be missed.</p>
<h3>Step 5: did something above or below override it?</h3>
<p>A rule above matched first; an input-device or tie-break setting favoured another member; hold-down time kept the session on the alternative after recovery. Match each possibility against what the commands showed.</p>
`+r([`Ticket`,`wrong link`,`Policy + route`,`allowed?`,`Rule hit`,`which rule?`,`Member state`,`alive, SLA ok?`,`Fix`,`order or setting`,`Walk the decision in order; one command per step.`])+`
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Rule has zero hits</td><td>Earlier rule matched, or criteria ANDed wrongly</td><td>Rule list and counters</td></tr>
<tr><td>First session wrong, later right</td><td>Application classified from cache</td><td>App-ctrl list</td></tr>
<tr><td>Traffic stays on backup after recovery</td><td>Hold-down time or recoverytime</td><td>Health check and rule setting</td></tr>
<tr><td>Flaps between members</td><td>Tiny metric differences</td><td>Threshold, hold-down, metric</td></tr>
<tr><td>Rule matches but no traffic</td><td>No policy or no route</td><td>Policy and routing table</td></tr></table>
<div class="warn"><p><b>Common mistake.</b> Changing rules before reading the service view. The commands usually show the cause in one screen; changes without evidence add new faults.</p></div>
<div class="exam"><p><b>Exam trap.</b> The first thing to check for "rule never used" is rule order and counters, not the health check. For "right rule, wrong member" check member state and SLA status.</p></div>
<div class="scn"><h4>Stuck on the backup</h4><p>After an ISP outage the primary came back, but traffic stayed on broadband for ten minutes. The health check showed alive, yet the rule had a hold-down time of 600 seconds. It was working as configured. The team reduced it to 60 seconds, since the link was stable.</p><p><b>Lesson:</b> Read the settings before declaring a bug.</p></div>
<div class="iv"><p class="q">"A flow uses the wrong link. Walk me through it."</p><p>Confirm policy and route; find the matching rule by counters or proute list; read the service view for member state and selection; check SLA status; for applications check the cache and ISDB freshness; finally consider tie-break and hold-down. Change one thing and retest.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Order of checks: policy and route, rule match, member and SLA state, classification, settings.</li><li>diagnose sys sdwan service4 shows the engine's view per rule.</li><li>diagnose firewall proute list shows the rules as the kernel sees them.</li><li>Change one thing at a time.</li></ul></div>
`,hi:`
<p>Classic ticket hai "yeh application galat link use karti hai". Andaza mat lagao. FortiGate jis order mein decision leta hai usi mein chalo: policy, rule match, member state, selection, session. Har step ka ek command hai.</p>
<h3>Step 1: kya traffic allowed aur routable hai?</h3>
<p>Rule traffic permit nahi karta. Confirm karo ki firewall policy match karti hai aur route maujood hai, jaise <code>get router info routing-table all</code> se. Agar policy galat hai to rules ka kuch maayne nahi.</p>
<h3>Step 2: session ne kaun sa rule match kiya?</h3>
<p>GUI mein hit counters ke saath rule list dekho, ya kernel ne jo policy-route entries banayi unhe <code>diagnose firewall proute list</code> se list karo. Zero hits wala rule, jiske upar bahut hits wala rule hai, aam doshi hota hai. Ek live session ke liye session table ya debug flow output use karo: woh pehle packet ka policy-route decision dikhata hai.</p>
<h3>Step 3: engine har member ke baare mein kya sochta hai?</h3>
<p>Service view rule ka mode, uske members aur current selection dikhata hai:</p>
<pre class="out"># Try it: lab "Zero hits wala voice rule" - illustrative output format, shortened
HQ-FGT # diagnose sys sdwan service4
Service(2): Address Mode(IPV4) ... Mode(priority), link-cost-factor(jitter)
  Members(2):
    1: Seq_num(3 HQ-T1), alive, jitter: 1.2, selected
    2: Seq_num(4 HQ-T2), alive, jitter: 24.8
  Dst address(1):
        198.51.100.0-198.51.100.255</pre>
<p>Mujhe general shape pakka pata hai: rule, uske members state aur metric ke saath, aur selected par marker, lekin field names aur extra flags builds ke beech badalte hain. Apna device jo print kare woh padho. State aur SLA status saath dekhne ke liye <code>diagnose sys sdwan member</code> aur <code>diagnose sys sdwan health-check</code> (fsd-sla se) use karo. Agar member <i>alive</i> nahi ya SLA fail hai to rule use nahi chunega.</p>
<h3>Step 4: kya classification problem raste mein hai?</h3>
<p>Application ya ISDB rules ke liye check karo ki FortiGuard status mein ISDB current hai aur application cache mein destination hai (<code>diagnose sys sdwan internet-service-app-ctrl-list</code>). Chapter 5 yaad rakho: pehla session chook sakta hai.</p>
<h3>Step 5: kya upar ya neeche kisi ne override kiya?</h3>
<p>Upar ke rule ne pehle match kiya; input-device ya tie-break setting ne doosre member ko prefer kiya; hold-down time ne recovery ke baad session ko alternative par rakha. Har possibility ko commands ke dikhaye se milao.</p>
`+r([`Ticket`,`galat link`,`Policy + route`,`allowed?`,`Rule hit`,`kaun sa rule?`,`Member state`,`alive, SLA ok?`,`Fix`,`order ya setting`,`Decision ko order mein chalo; har step ek command.`])+`
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit karan</th><th>Check</th></tr>
<tr><td>Rule ke zero hits</td><td>Pehle ka rule match hua, ya criteria galat AND hue</td><td>Rule list aur counters</td></tr>
<tr><td>Pehla session galat, baad ke sahi</td><td>Application cache se classify hui</td><td>App-ctrl list</td></tr>
<tr><td>Recovery ke baad traffic backup par</td><td>Hold-down time ya recoverytime</td><td>Health check aur rule setting</td></tr>
<tr><td>Members ke beech flap</td><td>Chhote metric farq</td><td>Threshold, hold-down, metric</td></tr>
<tr><td>Rule match, traffic nahi</td><td>Policy ya route nahi</td><td>Policy aur routing table</td></tr></table>
<div class="warn"><p><b>Common galti.</b> Service view padhne se pehle rules badalna. Commands aksar ek screen mein karan dikha dete hain; bina saboot ke badlav naye faults jodte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Rule kabhi use nahi hua" ke liye pehle rule order aur counters check karo, health check nahi. "Sahi rule, galat member" ke liye member state aur SLA status check karo.</p></div>
<div class="scn"><h4>Backup par atka hua</h4><p>ISP outage ke baad primary wapas aaya, lekin traffic das minute broadband par raha. Health check alive dikha raha tha, lekin rule mein hold-down time 600 seconds tha. Woh configured tareeke se kaam kar raha tha. Team ne use 60 seconds kar diya, kyunki link stable tha.</p><p><b>Seekh:</b> Bug kehne se pehle settings padho.</p></div>
<div class="iv"><p class="q">"Flow galat link use karta hai. Mujhe step by step batao."</p><p>Policy aur route confirm karo; counters ya proute list se matching rule dhundo; member state aur selection ke liye service view padho; SLA status check karo; applications ke liye cache aur ISDB freshness dekho; aakhir mein tie-break aur hold-down socho. Ek cheez badlo aur dobara test karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Checks ka order: policy aur route, rule match, member aur SLA state, classification, settings.</li><li>diagnose sys sdwan service4 har rule ke liye engine ka view dikhata hai.</li><li>diagnose firewall proute list rules ko kernel ki nazar se dikhata hai.</li><li>Ek baar mein ek cheez badlo.</li></ul></div>
`}};export{i as default};