var e={id:`observer`,h:{en:`The Observer pattern: tell me when it changes`,hi:`Observer pattern: badle to mujhe batao`},body:{en:`
<p>The second pattern named in the blueprint is <b>Observer</b>. It solves a very common problem in network software: <i>several things need to react when one thing changes, and the one thing should not have to know about them</i>.</p>

<h3>Analogy: a newspaper subscription</h3>
<p>You do not walk to the printing press every morning to ask whether there is a new edition. You <b>subscribe</b>; when the paper is printed, it is delivered to you and to every other subscriber. The newspaper does not know what you do with it (read it, wrap parcels, recycle) and a new subscriber does not require rebuilding the printing press. In the pattern, the newspaper is the <b>subject</b> and the readers are the <b>observers</b>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Observer pattern">
<rect x="20" y="75" width="190" height="80" rx="10" fill="#bae6fd"/><text x="115" y="105" text-anchor="middle" class="svg-ink" font-size="14" font-weight="bold">Subject</text><text x="115" y="127" text-anchor="middle" class="svg-ink" font-size="12">Switch SW1 (state)</text><text x="115" y="144" text-anchor="middle" class="svg-muted" font-size="11">keeps a list of observers</text>
<rect x="400" y="10" width="220" height="50" rx="8" fill="#bbf7d0"/><text x="510" y="40" text-anchor="middle" class="svg-ink" font-size="13">Logger: write to a file</text>
<rect x="400" y="90" width="220" height="50" rx="8" fill="#fde68a"/><text x="510" y="120" text-anchor="middle" class="svg-ink" font-size="13">Pager: alert the on-call</text>
<rect x="400" y="170" width="220" height="50" rx="8" fill="#ddd6fe"/><text x="510" y="200" text-anchor="middle" class="svg-ink" font-size="13">Dashboard: redraw the map</text>
<line x1="210" y1="100" x2="398" y2="40" stroke="#64748b" stroke-width="2"/><line x1="210" y1="115" x2="398" y2="115" stroke="#64748b" stroke-width="2"/><line x1="210" y1="130" x2="398" y2="195" stroke="#64748b" stroke-width="2"/>
<text x="300" y="22" text-anchor="middle" class="svg-muted" font-size="11">state changed: notify all</text>
</svg><p class="cap">When SW1 changes, it calls every subscribed observer. It does not know what they do.</p></div>

<h3>The pieces</h3>
<dl class="terms">
<dt>Subject (publisher)</dt><dd>The object whose state matters. It keeps a list of observers and offers <code>subscribe</code> and <code>unsubscribe</code>.</dd>
<dt>Observer (subscriber)</dt><dd>An object that wants to be told. It provides an <code>update</code> method that the subject calls.</dd>
<dt>Notification</dt><dd>When the subject changes, it loops over its observers and calls <code>update</code> on each, usually passing the new state.</dd>
</dl>

<h3>Observer in Python</h3>
<pre class="code">class Switch:                                    <span class="c"># the SUBJECT</span>
    def __init__(self, name):
        self.name = name
        self.state = "up"
        self.observers = []
    def subscribe(self, observer):
        self.observers.append(observer)
    def set_state(self, state):
        self.state = state
        for o in self.observers:                 <span class="c"># notify everyone subscribed</span>
            o.update(self.name, state)

class Logger:                                    <span class="c"># an OBSERVER</span>
    def update(self, name, state):
        print(f"LOG   {name} is now {state}")

class Pager:                                     <span class="c"># another OBSERVER</span>
    def update(self, name, state):
        if state == "down":
            print(f"PAGE  on-call: {name} is DOWN")

sw1 = Switch("SW1")
sw1.subscribe(Logger())
sw1.subscribe(Pager())
sw1.set_state("down")
sw1.set_state("up")</pre>
<pre class="out"><span class="hl">LOG   SW1 is now down</span>
<span class="hl">PAGE  on-call: SW1 is DOWN</span>
LOG   SW1 is now up</pre>
<p>Look at what did <b>not</b> happen: <code>Switch</code> contains no code about logging or paging. To add a Dashboard you write one new class and one <code>subscribe</code> line. <code>Switch</code> stays untouched. This is called <b>loose coupling</b>: the parts depend on a tiny agreement (the <code>update</code> method), not on each other's insides.</p>

<h3>Advantages of the Observer pattern</h3>
<ul>
<li><b>Loose coupling.</b> Subject and observers can change independently.</li>
<li><b>Easy to extend.</b> Add or remove observers at run time without editing the subject.</li>
<li><b>No wasteful polling.</b> Observers are told when something changes instead of asking every few seconds "has anything changed?".</li>
<li><b>One-to-many.</b> A single event can drive many reactions.</li>
</ul>
<p><b>Costs to remember.</b> Observers are notified in an order you may not control, a slow observer can delay the others, and forgotten observers that never unsubscribe cause bugs or memory use.</p>

<h3>Observer in the real network world</h3>
<ul>
<li><b>Webhooks.</b> A platform (a controller, a Git host, a chat system) calls your URL when an event happens. You subscribed by giving the address. The platform is the subject, your service is the observer.</li>
<li><b>Event notifications and streaming telemetry.</b> A device publishes state changes and several collectors subscribe.</li>
<li><b>SNMP traps and syslog.</b> A device sends an alert, and one or many receivers act on it.</li>
<li><b>GUI frameworks.</b> A button "click" event calls every function registered for it.</li>
</ul>
<div class="eg"><p>A branch router's WAN link flaps. The monitoring system (subject) announces "WAN1 down". The ticketing bot opens an incident, the chat bot posts in the NOC channel, and the dashboard turns the link red. Three observers, one event, and none of them knows about the others.</p></div>

<div class="warn"><p><b>Common mistake.</b> Confusing Observer with MVC. They are different patterns, although MVC often uses Observer inside: when the model changes, it notifies the views so they redraw. Another mistake: saying the observer <i>polls</i> the subject. In Observer the subject <i>pushes</i> a notification.</p></div>
<div class="exam"><p><b>Exam trap.</b> The key phrase is "one-to-many dependency: when one object changes state, all its dependents are notified and updated automatically". Distractors describe things like "creates objects without naming the class" (that is a Factory) or "separates data, display and input" (that is MVC). Know the subject and observer names.</p></div>

<div class="scn"><h4>Three tools polling one controller</h4><p>A team's three scripts each logged in to the network controller every 10 seconds to ask "any new alarms?". During a storm the controller slowed under the constant polling and some real alarms were noticed late. They switched to the controller's webhook: the controller now calls each script's address only when an alarm is raised. Load dropped and alerts arrived in about a second.</p><p><b>Lesson:</b> "tell me when it changes" scales better than "has it changed yet?".</p></div>
<div class="iv"><p class="q">"What is the Observer pattern and why use it?"</p><p>It defines a one-to-many relationship: a subject keeps a list of observers and notifies them automatically when its state changes. It gives loose coupling, lets you add reactions without changing the subject and avoids polling. Give an example such as a monitoring system notifying a logger, a pager and a dashboard, or a webhook.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Observer: a subject keeps subscribers and notifies them when its state changes.</li>
<li>Terms: subject (publisher), observer (subscriber), subscribe, notify, update.</li>
<li>Advantages: loose coupling, easy to extend, no polling, one event drives many actions.</li>
<li>Webhooks, SNMP traps and event streams are Observer in the real world.</li>
<li>Do not confuse it with MVC: Observer is about notification, MVC is about separating roles.</li>
</ul></div>
`,hi:`
<p>Blueprint mein naam wala doosra pattern hai <b>Observer</b>. Yeh network software ki ek bahut aam problem solve karta hai: <i>jab ek cheez badle to kai cheezon ko react karna hai, aur us ek cheez ko unke baare mein jaanna nahi chahiye</i>.</p>

<h3>Analogy: akhbaar ki subscription</h3>
<p>Aap roz subah printing press jaakar nahi poochte ki naya edition aaya ya nahi. Aap <b>subscribe</b> karte ho; jab akhbaar chhapta hai, woh aap tak aur har doosre subscriber tak pahunchta hai. Akhbaar ko nahi pata aap use kya karte ho (padhte ho, parcel lapetate ho, recycle karte ho) aur naye subscriber ke liye printing press dobara nahi banani padti. Pattern mein akhbaar <b>subject</b> hai aur padhne wale <b>observers</b>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Observer pattern">
<rect x="20" y="75" width="190" height="80" rx="10" fill="#bae6fd"/><text x="115" y="105" text-anchor="middle" class="svg-ink" font-size="14" font-weight="bold">Subject</text><text x="115" y="127" text-anchor="middle" class="svg-ink" font-size="12">Switch SW1 (state)</text><text x="115" y="144" text-anchor="middle" class="svg-muted" font-size="11">observers ki list rakhta hai</text>
<rect x="400" y="10" width="220" height="50" rx="8" fill="#bbf7d0"/><text x="510" y="40" text-anchor="middle" class="svg-ink" font-size="13">Logger: file mein likho</text>
<rect x="400" y="90" width="220" height="50" rx="8" fill="#fde68a"/><text x="510" y="120" text-anchor="middle" class="svg-ink" font-size="13">Pager: on-call ko alert</text>
<rect x="400" y="170" width="220" height="50" rx="8" fill="#ddd6fe"/><text x="510" y="200" text-anchor="middle" class="svg-ink" font-size="13">Dashboard: map redraw</text>
<line x1="210" y1="100" x2="398" y2="40" stroke="#64748b" stroke-width="2"/><line x1="210" y1="115" x2="398" y2="115" stroke="#64748b" stroke-width="2"/><line x1="210" y1="130" x2="398" y2="195" stroke="#64748b" stroke-width="2"/>
<text x="300" y="22" text-anchor="middle" class="svg-muted" font-size="11">state badli: sabko notify</text>
</svg><p class="cap">SW1 badalta hai to har subscribed observer ko call karta hai. Use nahi pata woh kya karte hain.</p></div>

<h3>Pieces</h3>
<dl class="terms">
<dt>Subject (publisher)</dt><dd>Woh object jiski state matter karti hai. Yeh observers ki list rakhta hai aur <code>subscribe</code> aur <code>unsubscribe</code> deta hai.</dd>
<dt>Observer (subscriber)</dt><dd>Woh object jo bataya jana chahta hai. Yeh ek <code>update</code> method deta hai jise subject call karta hai.</dd>
<dt>Notification</dt><dd>Subject badalta hai to apne observers par loop karke har ek par <code>update</code> call karta hai, aam taur par nayi state pass karke.</dd>
</dl>

<h3>Python mein Observer</h3>
<pre class="code">class Switch:                                    <span class="c"># SUBJECT</span>
    def __init__(self, name):
        self.name = name
        self.state = "up"
        self.observers = []
    def subscribe(self, observer):
        self.observers.append(observer)
    def set_state(self, state):
        self.state = state
        for o in self.observers:                 <span class="c"># jo subscribed hain sabko notify</span>
            o.update(self.name, state)

class Logger:                                    <span class="c"># ek OBSERVER</span>
    def update(self, name, state):
        print(f"LOG   {name} is now {state}")

class Pager:                                     <span class="c"># doosra OBSERVER</span>
    def update(self, name, state):
        if state == "down":
            print(f"PAGE  on-call: {name} is DOWN")

sw1 = Switch("SW1")
sw1.subscribe(Logger())
sw1.subscribe(Pager())
sw1.set_state("down")
sw1.set_state("up")</pre>
<pre class="out"><span class="hl">LOG   SW1 is now down</span>
<span class="hl">PAGE  on-call: SW1 is DOWN</span>
LOG   SW1 is now up</pre>
<p>Dekho kya <b>nahi</b> hua: <code>Switch</code> mein logging ya paging ka koi code nahi hai. Dashboard jodne ke liye ek nayi class aur ek <code>subscribe</code> line likhte ho. <code>Switch</code> chhua bhi nahi jaata. Ise <b>loose coupling</b> kehte hain: hisse ek chhote agreement (<code>update</code> method) par depend karte hain, ek doosre ke andar ke code par nahi.</p>

<h3>Observer pattern ke advantages</h3>
<ul>
<li><b>Loose coupling.</b> Subject aur observers alag alag badal sakte hain.</li>
<li><b>Extend karna aasaan.</b> Run time par observers jodo ya hatao, subject edit kiye bina.</li>
<li><b>Bekaar polling nahi.</b> Har kuch second mein "kuch badla?" poochne ki jagah observers ko badalne par bataya jaata hai.</li>
<li><b>One-to-many.</b> Ek event kai reactions chala sakta hai.</li>
</ul>
<p><b>Yaad rakhne wali costs.</b> Observers ko notify karne ka order aapke control mein na ho, ek slow observer baaki ko rok sakta hai, aur jo observers kabhi unsubscribe nahi karte woh bugs ya memory use paida karte hain.</p>

<h3>Asli network duniya mein Observer</h3>
<ul>
<li><b>Webhooks.</b> Koi platform (controller, Git host, chat system) event hone par aapke URL ko call karta hai. Aapne address dekar subscribe kiya. Platform subject hai, aapki service observer.</li>
<li><b>Event notifications aur streaming telemetry.</b> Device state changes publish karta hai aur kai collectors subscribe karte hain.</li>
<li><b>SNMP traps aur syslog.</b> Device alert bhejta hai, aur ek ya kai receivers uspar action lete hain.</li>
<li><b>GUI frameworks.</b> Button ka "click" event har registered function ko call karta hai.</li>
</ul>
<div class="eg"><p>Branch router ka WAN link flap karta hai. Monitoring system (subject) "WAN1 down" announce karta hai. Ticketing bot incident kholta hai, chat bot NOC channel mein post karta hai, aur dashboard link ko laal kar deta hai. Teen observers, ek event, aur koi bhi doosron ke baare mein nahi jaanta.</p></div>

<div class="warn"><p><b>Aam galti.</b> Observer ko MVC se confuse karna. Yeh alag patterns hain, halanki MVC aksar andar Observer use karta hai: model badalta hai to views ko notify karta hai taaki woh redraw karein. Ek aur galti: yeh kehna ki observer subject ko <i>poll</i> karta hai. Observer mein subject notification <i>push</i> karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Key phrase hai "one-to-many dependency: jab ek object ki state badalti hai, uske saare dependents automatically notify aur update hote hain". Distractors aisi cheezein describe karte hain jaise "class ka naam bataye bina objects banata hai" (yeh Factory hai) ya "data, display aur input ko alag karta hai" (yeh MVC hai). Subject aur observer ke naam jaano.</p></div>

<div class="scn"><h4>Ek controller par teen polling tools</h4><p>Ek team ki teen scripts har 10 second mein network controller mein login karke poochti thi "koi naye alarms?". Toofan ke dauran lagatar polling ke neeche controller slow hua aur kuch asli alarms der se pakde gaye. Unhone controller ke webhook par switch kiya: ab controller har script ke address ko sirf tab call karta hai jab alarm raise ho. Load gira aur alerts lagbhag ek second mein aane lage.</p><p><b>Lesson:</b> "badle to batao" "kya badla?" se behtar scale karta hai.</p></div>
<div class="iv"><p class="q">"Observer pattern kya hai aur kyun use karte hain?"</p><p>Yeh one-to-many relationship define karta hai: subject observers ki list rakhta hai aur state badalne par unhe automatically notify karta hai. Isse loose coupling milti hai, subject badle bina reactions jod sakte ho aur polling bachti hai. Example do jaise monitoring system jo logger, pager aur dashboard ko notify karta hai, ya webhook.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Observer: subject subscribers rakhta hai aur state badalne par unhe notify karta hai.</li>
<li>Terms: subject (publisher), observer (subscriber), subscribe, notify, update.</li>
<li>Advantages: loose coupling, extend karna aasaan, polling nahi, ek event se kai actions.</li>
<li>Webhooks, SNMP traps aur event streams asli duniya ka Observer hain.</li>
<li>MVC se confuse mat karo: Observer notification ke baare mein hai, MVC roles alag karne ke baare mein.</li>
</ul></div>
`}};export{e as default};