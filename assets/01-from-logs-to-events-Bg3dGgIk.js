var e={id:`from-logs-to-events`,h:{en:`From logs to events: why nobody can read every log`,hi:`Logs se events tak: har log koi kyun nahi padh sakta`},body:{en:`
<div class="note"><p><b>What you will learn.</b> Why a stored log is not the same as a warning, what an event handler, an event and an incident are, how they follow each other, and which parts of this module run in the simulator. <b>Prerequisites:</b> you know that a FortiGate sends logs to a FortiAnalyzer, that the device must be registered, and that Log View shows the stored logs (modules faz-start and faz-logview). No security operations experience is needed.</p></div>

<p>Imagine the control room of a shopping mall with forty CCTV cameras. All cameras record all day. The recordings are valuable, but nobody watches forty screens for eight hours. What the guard really needs is an alarm: "someone has tried the same locked door five times in two minutes". The recording is the proof, the alarm is what makes a person look. A FortiAnalyzer works in the same way. The logs are the recording. Event handlers are the alarm rules.</p>

<h3>The problem: too many logs, too little attention</h3>
<p>A <b>log</b> is one record that a FortiGate writes about something that happened, for example one network session that was allowed or denied. Kaveri Retail is small, yet every web request from a PC creates a log on the FortiGate. In a busy company this is thousands of logs per minute.</p>
<div class="eg"><p><b>Worked example.</b> Suppose the three FortiGates of Kaveri together write 200 logs per minute. In an eight hour shift that is 200 x 60 x 8 = 96,000 logs. If an analyst needed only five seconds per log, reading them all would take about 133 hours, more than three working weeks, for one shift. So reading is impossible and "we log everything" does not protect anybody by itself. Something must watch the logs for us and call a person only when a pattern appears.</p></div>

<h3>The four words of this module</h3>
<dl class="terms">
<dt>Event handler</dt><dd>A rule stored on the FortiAnalyzer. It says: look at logs of this type that match this filter, and if you see this many of them within this many minutes, raise an event.</dd>
<dt>Event</dt><dd>The result when a handler rule is satisfied: one line that says which handler fired, how severe it is, which device and which source, and how many logs counted. A new event starts as <code>unhandled</code>.</dd>
<dt>Incident</dt><dd>A case that a person opens for an event worth investigating. It has a title, a severity, a status and notes, so the work is tracked.</dd>
<dt>Severity</dt><dd>How serious the handler author considers the pattern: low, medium, high or critical.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Logs, handler, event, incident">
<rect x="10" y="40" width="130" height="62" rx="8" fill="#e2e8f0"/><text x="75" y="66" text-anchor="middle" class="svg-ink" font-size="13">Logs</text><text x="75" y="86" text-anchor="middle" class="svg-muted" font-size="12">thousands</text>
<rect x="175" y="40" width="130" height="62" rx="8" fill="#ddd6fe"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="13">Event handler</text><text x="240" y="86" text-anchor="middle" class="svg-muted" font-size="12">the rule</text>
<rect x="340" y="40" width="130" height="62" rx="8" fill="#fde68a"/><text x="405" y="66" text-anchor="middle" class="svg-ink" font-size="13">Event</text><text x="405" y="86" text-anchor="middle" class="svg-muted" font-size="12">the alarm</text>
<rect x="505" y="40" width="125" height="62" rx="8" fill="#bbf7d0"/><text x="567" y="66" text-anchor="middle" class="svg-ink" font-size="13">Incident</text><text x="567" y="86" text-anchor="middle" class="svg-muted" font-size="12">the case</text>
<line x1="140" y1="71" x2="175" y2="71" stroke="#64748b" stroke-width="2"/><line x1="305" y1="71" x2="340" y2="71" stroke="#64748b" stroke-width="2"/><line x1="470" y1="71" x2="505" y2="71" stroke="#64748b" stroke-width="2"/>
<text x="320" y="128" text-anchor="middle" class="svg-accent" font-size="12">many logs, a few events, fewer incidents</text>
</svg><p class="cap">The funnel: every step has fewer items than the one before.</p></div>

<h3>Why it matters</h3>
<p>The funnel is the whole idea of this module. Each step removes noise. A handler turns thousands of logs into a handful of events. A person looks at the events and opens an incident only for those that need work. The incident then keeps a record of who decided what. Without this chain, one of two things happens: nobody looks at the logs at all, or an analyst drowns in them and misses the one pattern that mattered.</p>

<h3>How the simulator presents this</h3>
<p>In the real product, event handlers and incidents are created in the FortiAnalyzer GUI. The simulator offers them as commands on FAZ-1 so that you can practise without a browser. Inside the module the stand-ins are <code>execute fazui handler create | list</code>, <code>execute fazui events &lt;adom&gt; list</code> and <code>execute fazui incident create | list | update</code>, and the tables <code>config faz event-handler</code> and <code>config faz incident</code>. These command names do not exist on a real FortiAnalyzer. The logs they work on are real simulator logs, written by the firewall from the traffic you generate.</p>
<pre class="out">FAZ-1 # execute fazui events root list
<span class="hl">No events in ADOM root.</span></pre>
<p>That empty list is the normal state of a quiet network. An empty list is good news, as long as the handlers are correct. Chapters 5 and 6 teach you how to tell the difference.</p>

<div class="warn"><p><b>Honest boundaries.</b> Theory only, not modelled in the simulator: sending a notification by email or syslog when an event fires, handler templates, automation, FortiSOAR playbooks, assignment of incidents and file attachments. We mention them where useful and label them as theory.</p></div>

<div class="exam"><p><b>Exam trap.</b> A log, an event and an incident are three different things. A log is stored evidence, an event is a rule result, an incident is a human case. Do not say "the handler creates an incident": a handler creates an event, a person (or an automation, in the real product) creates the incident.</p></div>

<div class="scn"><h4>Forty thousand logs and one missed pattern</h4><p>A retail chain kept all firewall logs for ninety days and was proud of it. When a branch PC was found infected, the review showed that the same PC had been denied by the firewall every few seconds for a whole afternoon, 400 times. The logs had the proof, but nobody read them and no handler existed. After the incident the team created one handler: many denied sessions from one source in a few minutes raises a high event.</p><p><b>Lesson:</b> storing logs is only half of logging. A handler makes the pattern visible while it is still happening.</p></div>

<div class="iv"><p class="q">"What is the difference between a log, an event and an incident?"</p><p>A log is one record of something that happened. An event is the alarm raised when a handler rule matches enough logs within a time window. An incident is a case that an analyst opens for an event and works through statuses. Add that the funnel reduces noise at every step.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Nobody can read every log; handlers watch the logs and raise events when a pattern appears.</li>
<li>Log, event and incident are three different objects: evidence, alarm, case.</li>
<li>An event starts as unhandled; an incident is opened by a person for an event worth work.</li>
<li>In the simulator, handlers, events and incidents are <code>execute fazui</code> stand-ins for GUI actions.</li>
<li>Notifications, playbooks and FortiSOAR are theory only.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>What you will learn.</b> Is chapter mein aap seekhoge ki stored log aur warning mein kya fark hai, event handler, event aur incident kya hote hain, ye ek ke baad ek kaise aate hain, aur is module ka kaun sa hissa simulator mein chalta hai. <b>Prerequisites:</b> aapko pata ho ki FortiGate logs FortiAnalyzer ko bhejta hai, device registered hona chahiye, aur Log View stored logs dikhata hai (modules faz-start aur faz-logview). Security operations ka koi experience zaroori nahi hai.</p></div>

<p>Ek shopping mall ka control room socho jismein chalis CCTV cameras hain. Saare cameras din bhar record karte hain. Recordings kaam ki hain, par aath ghante tak chalis screens koi nahi dekhta. Guard ko asal mein ek alarm chahiye: "kisi ne do minute mein ek hi locked door paanch baar try kiya". Recording proof hai, alarm wo cheez hai jo insaan ko dekhne par majboor karti hai. FortiAnalyzer bhi aise hi kaam karta hai. Logs recording hain. Event handlers alarm rules hain.</p>

<h3>Problem: logs bahut, dhyaan kam</h3>
<p><b>Log</b> ek record hota hai jo FortiGate kisi hui cheez ke baare mein likhta hai, jaise ek network session jo allow ya deny hua. Kaveri Retail chhota hai, phir bhi PC se har web request FortiGate par ek log banati hai. Busy company mein ye har minute hazaaron logs hote hain.</p>
<div class="eg"><p><b>Worked example.</b> Maan lo Kaveri ke teeno FortiGates milkar 200 logs per minute likhte hain. Aath ghante ki shift mein ye 200 x 60 x 8 = 96,000 logs hue. Agar analyst ko har log ke liye sirf paanch second chahiye, to sab padhne mein lagbhag 133 ghante lagenge, yaani ek shift ke liye teen working weeks se zyada. Matlab padhna impossible hai aur "hum sab kuch log karte hain" akela kisi ko protect nahi karta. Koi aur cheez hamare liye logs ko dekhe aur pattern dikhne par hi insaan ko bulaye.</p></div>

<h3>Is module ke chaar words</h3>
<dl class="terms">
<dt>Event handler</dt><dd>FortiAnalyzer par stored ek rule. Ye kehta hai: is type ke logs dekho jo is filter se match karte hain, aur agar itne minutes mein itne logs dikhen to event raise karo.</dd>
<dt>Event</dt><dd>Jab handler rule poora hota hai to uska result: ek line jo batati hai kaun sa handler fire hua, kitna severe hai, kaun sa device aur kaun sa source, aur kitne logs gine gaye. Naya event <code>unhandled</code> se shuru hota hai.</dd>
<dt>Incident</dt><dd>Ek case jo insaan us event ke liye kholta hai jise investigate karna worth hai. Ismein title, severity, status aur notes hote hain, taaki kaam track ho.</dd>
<dt>Severity</dt><dd>Handler likhne wala pattern ko kitna serious maanta hai: low, medium, high ya critical.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Logs, handler, event, incident">
<rect x="10" y="40" width="130" height="62" rx="8" fill="#e2e8f0"/><text x="75" y="66" text-anchor="middle" class="svg-ink" font-size="13">Logs</text><text x="75" y="86" text-anchor="middle" class="svg-muted" font-size="12">hazaaron</text>
<rect x="175" y="40" width="130" height="62" rx="8" fill="#ddd6fe"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="13">Event handler</text><text x="240" y="86" text-anchor="middle" class="svg-muted" font-size="12">rule</text>
<rect x="340" y="40" width="130" height="62" rx="8" fill="#fde68a"/><text x="405" y="66" text-anchor="middle" class="svg-ink" font-size="13">Event</text><text x="405" y="86" text-anchor="middle" class="svg-muted" font-size="12">alarm</text>
<rect x="505" y="40" width="125" height="62" rx="8" fill="#bbf7d0"/><text x="567" y="66" text-anchor="middle" class="svg-ink" font-size="13">Incident</text><text x="567" y="86" text-anchor="middle" class="svg-muted" font-size="12">case</text>
<line x1="140" y1="71" x2="175" y2="71" stroke="#64748b" stroke-width="2"/><line x1="305" y1="71" x2="340" y2="71" stroke="#64748b" stroke-width="2"/><line x1="470" y1="71" x2="505" y2="71" stroke="#64748b" stroke-width="2"/>
<text x="320" y="128" text-anchor="middle" class="svg-accent" font-size="12">bahut logs, kuch events, usse kam incidents</text>
</svg><p class="cap">Funnel: har step mein pichle step se kam items hote hain.</p></div>

<h3>Yeh kyun zaroori hai</h3>
<p>Is module ka poora idea yahi funnel hai. Har step noise hatata hai. Handler hazaaron logs ko kuch events mein badal deta hai. Insaan events dekhta hai aur incident sirf unke liye kholta hai jin par kaam chahiye. Incident phir record rakhta hai ki kisne kya decide kiya. Is chain ke bina do mein se ek hota hai: ya to logs koi dekhta hi nahi, ya analyst unmein doob jata hai aur wahi ek pattern miss kar deta hai jo matter karta tha.</p>

<h3>Simulator ise kaise dikhata hai</h3>
<p>Real product mein event handlers aur incidents FortiAnalyzer GUI mein bante hain. Simulator unhe FAZ-1 par commands ki tarah deta hai taaki aap browser ke bina practice kar sako. Is module mein stand-ins hain <code>execute fazui handler create | list</code>, <code>execute fazui events &lt;adom&gt; list</code> aur <code>execute fazui incident create | list | update</code>, aur tables <code>config faz event-handler</code> aur <code>config faz incident</code>. Ye command names real FortiAnalyzer par nahi hote. Jin logs par ye kaam karte hain wo real simulator logs hain, jo firewall aapke generate kiye traffic se likhta hai.</p>
<pre class="out">FAZ-1 # execute fazui events root list
<span class="hl">No events in ADOM root.</span></pre>
<p>Ye khaali list quiet network ki normal state hai. Khaali list achhi khabar hai, bas handlers sahi hone chahiye. Chapters 5 aur 6 sikhate hain ki dono mein fark kaise karein.</p>

<div class="warn"><p><b>Honest boundaries.</b> Sirf theory, simulator mein modelled nahi: event fire hone par email ya syslog se notification bhejna, handler templates, automation, FortiSOAR playbooks, incidents ka assignment aur file attachments. Hum inhe jahan kaam ke hon wahan mention karte hain aur theory likhte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Log, event aur incident teen alag cheezein hain. Log stored evidence hai, event rule ka result hai, incident insaan ka case hai. "Handler incident banata hai" mat bolo: handler event banata hai, incident insaan (ya real product mein automation) banata hai.</p></div>

<div class="scn"><h4>Chalis hazaar logs aur ek chhooti hui pattern</h4><p>Ek retail chain ne nabbe din tak saare firewall logs rakhe aur is par garv bhi tha. Jab ek branch PC infected mili, review mein dikha ki wahi PC poori dopahar har kuch second mein firewall se deny hoti rahi, 400 baar. Logs mein proof tha, par kisi ne padhe nahi aur koi handler tha hi nahi. Incident ke baad team ne ek handler banaya: ek source se kuch minutes mein bahut saare denied sessions aaye to high event raise ho.</p><p><b>Lesson:</b> logs store karna logging ka sirf aadha hissa hai. Handler pattern ko tab dikhata hai jab wo ho hi raha ho.</p></div>

<div class="iv"><p class="q">"Log, event aur incident mein kya fark hai?"</p><p>Log ek hui cheez ka ek record hai. Event wo alarm hai jo handler rule ke time window mein kaafi logs match karne par raise hota hai. Incident wo case hai jo analyst event ke liye kholta hai aur statuses se guzarta hai. Ye bhi bolo ki funnel har step par noise kam karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har log koi nahi padh sakta; handlers logs dekhte hain aur pattern aane par events raise karte hain.</li>
<li>Log, event aur incident teen alag objects hain: evidence, alarm, case.</li>
<li>Event unhandled se shuru hota hai; incident insaan us event ke liye kholta hai jis par kaam chahiye.</li>
<li>Simulator mein handlers, events aur incidents GUI actions ke <code>execute fazui</code> stand-ins hain.</li>
<li>Notifications, playbooks aur FortiSOAR sirf theory hain.</li>
</ul></div>
`}};export{e as default};