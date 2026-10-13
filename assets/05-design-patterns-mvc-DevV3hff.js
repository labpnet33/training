var e={id:`patterns-mvc`,h:{en:`Design patterns and the MVC pattern`,hi:`Design patterns aur MVC pattern`},body:{en:`
<p>Blueprint item 1.6 asks for the <b>advantages of design patterns</b> and for two of them by name: <b>MVC</b> and <b>Observer</b>. This chapter explains what a pattern is and MVC. The next chapter covers Observer.</p>

<h3>Analogy: recipes and floor plans</h3>
<p>A cook does not invent a way to make dal from scratch each day; there is a tried recipe. An architect designing a school does not rediscover that classrooms open onto a corridor; that layout is a known pattern. A <b>design pattern</b> is the same for software: a <b>named, proven, reusable solution to a problem that keeps appearing</b>. It is not finished code you copy; it is an idea you adapt to your language and situation.</p>

<h3>Advantages of design patterns</h3>
<ul>
<li><b>Proven.</b> Many developers have hit the problem before; the pattern captures a solution that already survived real use.</li>
<li><b>Shared vocabulary.</b> Saying "use the Observer pattern" conveys a whole design in four words. Teams discuss and review faster.</li>
<li><b>Faster design.</b> You start from a known solution instead of a blank page.</li>
<li><b>Maintainability.</b> A pattern's structure is familiar, so the next engineer finds their way around quickly.</li>
<li><b>Flexibility.</b> Many patterns exist to make future change cheap, for example swapping one piece without touching the others.</li>
</ul>
<div class="warn"><p><b>Common mistake.</b> Forcing a pattern where a simple function would do. A pattern is a tool, not a badge. Also: a pattern is not a library you install. It is a way of arranging your own code.</p></div>

<h3>MVC: Model, View, Controller</h3>
<p><b>MVC</b> splits an application that shows data to people into three parts with separate jobs:</p>
<dl class="terms">
<dt>Model</dt><dd>The data and the rules about it. It knows what a VLAN is, which VLANs exist, and what makes one valid. It does not know how anything is displayed.</dd>
<dt>View</dt><dd>What the user sees: a web page, a table, a text report. It reads from the model and formats it. It holds no business rules.</dd>
<dt>Controller</dt><dd>The go-between. It receives the user's input (a click, a form, an API request), asks the model to change or return data, and chooses which view to show.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MVC flow">
<rect x="20" y="95" width="120" height="50" rx="25" fill="#e2e8f0"/><text x="80" y="125" text-anchor="middle" class="svg-ink" font-size="13">User</text>
<rect x="230" y="20" width="180" height="55" rx="8" fill="#bae6fd"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">Controller</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="11">handles the request</text>
<rect x="450" y="95" width="170" height="55" rx="8" fill="#bbf7d0"/><text x="535" y="119" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">Model</text><text x="535" y="137" text-anchor="middle" class="svg-muted" font-size="11">data and rules</text>
<rect x="230" y="165" width="180" height="55" rx="8" fill="#fde68a"/><text x="320" y="189" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">View</text><text x="320" y="207" text-anchor="middle" class="svg-muted" font-size="11">draws the screen</text>
<line x1="140" y1="108" x2="228" y2="60" stroke="#64748b" stroke-width="2"/><text x="150" y="70" class="svg-muted" font-size="11">1 input</text>
<line x1="410" y1="55" x2="480" y2="93" stroke="#64748b" stroke-width="2"/><text x="448" y="62" class="svg-muted" font-size="11">2 update</text>
<line x1="500" y1="150" x2="412" y2="185" stroke="#64748b" stroke-width="2"/><text x="478" y="182" class="svg-muted" font-size="11">3 read</text>
<line x1="230" y1="190" x2="140" y2="140" stroke="#64748b" stroke-width="2"/><text x="150" y="182" class="svg-muted" font-size="11">4 output</text>
</svg><p class="cap">A request travels: user to controller, controller updates the model, the view reads the model and shows the result to the user.</p></div>

<h3>A small MVC example in Python</h3>
<p>A tiny VLAN manager in three parts. Each part has one job and can be changed without touching the others.</p>
<pre class="code">class VlanModel:                                <span class="c"># MODEL: data + rules</span>
    def __init__(self):
        self.vlans = {}
    def add(self, vid, name):
        if not (isinstance(vid, int) and 1 &lt;= vid &lt;= 4094):
            raise ValueError(f"bad VLAN id {vid}")
        self.vlans[vid] = name

class TextView:                                 <span class="c"># VIEW: only formatting</span>
    def show(self, vlans):
        for vid in sorted(vlans):
            print(f"VLAN {vid:&gt;4}  {vlans[vid]}")
    def show_error(self, msg):
        print("ERROR:", msg)

class Controller:                               <span class="c"># CONTROLLER: connects them</span>
    def __init__(self, model, view):
        self.model = model
        self.view = view
    def handle_add(self, vid, name):
        try:
            self.model.add(vid, name)
            self.view.show(self.model.vlans)
        except ValueError as e:
            self.view.show_error(e)

app = Controller(VlanModel(), TextView())
app.handle_add(10, "USERS")
app.handle_add(20, "VOICE")
app.handle_add(5000, "BAD")</pre>
<pre class="out">VLAN   10  USERS
VLAN   10  USERS
VLAN   20  VOICE
<span class="hl">ERROR: bad VLAN id 5000</span></pre>
<p>If tomorrow the team wants an HTML table instead of text, only the view changes. If the VLAN limit rules change, only the model changes. That separation is the whole point.</p>

<h3>Where you meet MVC</h3>
<p>Web frameworks (Django, Flask apps, Ruby on Rails) and many network tools use it. The browser UI of a controller is the view; the REST API handler is the controller; the database of devices and VLANs is the model. In Django the same idea is called MTV (model, template, view), but the roles line up.</p>
<div class="exam"><p><b>Exam trap.</b> Match the job to the letter. "Stores the data and enforces the rules" is the model. "Renders output" is the view. "Takes user input and coordinates" is the controller. A view that runs business rules, or a model that prints HTML, breaks the pattern. A common distractor says the controller stores the data.</p></div>
<p><b>Advantages of MVC.</b> Separation of concerns; several views can show the same model (web page and CLI report); teams can work in parallel (a front-end developer on views, a back-end developer on the model); and each part can be tested alone.</p>

<div class="scn"><h4>Same data, two screens</h4><p>An operations team had a VLAN report script that mixed database calls, validation and print statements. The manager asked for a web dashboard as well. With the logic tangled into the printing code, the team would have copied it, so the two copies would drift apart. They moved the rules into a model class and made two views, one text and one HTML. The next rule change was made once.</p><p><b>Lesson:</b> keep data and rules separate from display.</p></div>
<div class="iv"><p class="q">"Explain MVC with an example."</p><p>MVC separates an application into the model (data and business rules), the view (presentation) and the controller (receives input and coordinates the other two). Example: in a VLAN manager, the model validates and stores VLANs, the view renders a table, the controller handles "add VLAN" requests. The advantages are separation of concerns, several views of one model, and independent testing and teamwork.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A design pattern is a named, proven, reusable solution to a common problem, not copy-paste code.</li>
<li>Advantages: proven, shared vocabulary, faster design, maintainable, flexible.</li>
<li>MVC: Model = data and rules, View = display, Controller = input and coordination.</li>
<li>MVC lets you change the screen without touching the rules, and test each part alone.</li>
<li>Do not force a pattern where a simple function is enough.</li>
</ul></div>
`,hi:`
<p>Blueprint item 1.6 <b>design patterns ke advantages</b> maangta hai aur do ko naam se: <b>MVC</b> aur <b>Observer</b>. Yeh chapter samjhata hai pattern kya hai aur MVC. Agla chapter Observer cover karta hai.</p>

<h3>Analogy: recipes aur floor plans</h3>
<p>Cook roz scratch se dal banane ka tareeka nahi dhoondhta; ek aazmaya hua recipe hai. School design karne wala architect yeh dobara discover nahi karta ki classrooms corridor mein khulte hain; woh layout ek jaana-pehchana pattern hai. <b>Design pattern</b> software ke liye wahi hai: <b>aisi problem ka naam wala, aazmaya hua, reusable solution jo baar baar aati hai</b>. Yeh copy karne wala tayyar code nahi hai; yeh ek idea hai jise aap apni language aur situation ke hisaab se adapt karte ho.</p>

<h3>Design patterns ke advantages</h3>
<ul>
<li><b>Proven.</b> Kai developers pehle yeh problem jhel chuke hain; pattern ek aisa solution pakadta hai jo asli use mein bach chuka hai.</li>
<li><b>Shared vocabulary.</b> "Observer pattern use karo" kehna chaar shabdon mein poora design bata deta hai. Teams discuss aur review tez karti hain.</li>
<li><b>Tez design.</b> Aap khaali page ki jagah jaane-pehchane solution se shuru karte ho.</li>
<li><b>Maintainability.</b> Pattern ka structure familiar hota hai, isliye agla engineer jaldi raasta dhoondh leta hai.</li>
<li><b>Flexibility.</b> Kai patterns isliye hain ki aage ka change sasta ho, jaise ek piece badalna bina baaki ko chhue.</li>
</ul>
<div class="warn"><p><b>Aam galti.</b> Jahan simple function kaafi ho wahan pattern thoosna. Pattern ek tool hai, badge nahi. Aur: pattern koi library nahi jo install karte ho. Yeh apne code ko arrange karne ka tareeka hai.</p></div>

<h3>MVC: Model, View, Controller</h3>
<p><b>MVC</b> log ko data dikhane wali application ko alag alag kaam wale teen hisson mein baantta hai:</p>
<dl class="terms">
<dt>Model</dt><dd>Data aur uske baare mein rules. Use pata hai VLAN kya hai, kaun se VLANs hain, aur kya use valid banata hai. Use nahi pata ki kuch kaise display hota hai.</dd>
<dt>View</dt><dd>Jo user dekhta hai: web page, table, text report. Yeh model se padhta hai aur format karta hai. Isme business rules nahi hote.</dd>
<dt>Controller</dt><dd>Beech ka aadmi. Yeh user ka input (click, form, API request) leta hai, model se data badalne ya lautane ko kehta hai, aur chunta hai kaun sa view dikhana hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MVC flow">
<rect x="20" y="95" width="120" height="50" rx="25" fill="#e2e8f0"/><text x="80" y="125" text-anchor="middle" class="svg-ink" font-size="13">User</text>
<rect x="230" y="20" width="180" height="55" rx="8" fill="#bae6fd"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">Controller</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="11">request handle karta hai</text>
<rect x="450" y="95" width="170" height="55" rx="8" fill="#bbf7d0"/><text x="535" y="119" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">Model</text><text x="535" y="137" text-anchor="middle" class="svg-muted" font-size="11">data aur rules</text>
<rect x="230" y="165" width="180" height="55" rx="8" fill="#fde68a"/><text x="320" y="189" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">View</text><text x="320" y="207" text-anchor="middle" class="svg-muted" font-size="11">screen banata hai</text>
<line x1="140" y1="108" x2="228" y2="60" stroke="#64748b" stroke-width="2"/><text x="150" y="70" class="svg-muted" font-size="11">1 input</text>
<line x1="410" y1="55" x2="480" y2="93" stroke="#64748b" stroke-width="2"/><text x="448" y="62" class="svg-muted" font-size="11">2 update</text>
<line x1="500" y1="150" x2="412" y2="185" stroke="#64748b" stroke-width="2"/><text x="478" y="182" class="svg-muted" font-size="11">3 read</text>
<line x1="230" y1="190" x2="140" y2="140" stroke="#64748b" stroke-width="2"/><text x="150" y="182" class="svg-muted" font-size="11">4 output</text>
</svg><p class="cap">Request ka safar: user se controller, controller model update karta hai, view model padhta hai aur result user ko dikhata hai.</p></div>

<h3>Python mein ek chhota MVC example</h3>
<p>Teen hisson mein ek chhota VLAN manager. Har hisse ka ek kaam hai aur baaki ko chhue bina badla ja sakta hai.</p>
<pre class="code">class VlanModel:                                <span class="c"># MODEL: data + rules</span>
    def __init__(self):
        self.vlans = {}
    def add(self, vid, name):
        if not (isinstance(vid, int) and 1 &lt;= vid &lt;= 4094):
            raise ValueError(f"bad VLAN id {vid}")
        self.vlans[vid] = name

class TextView:                                 <span class="c"># VIEW: sirf formatting</span>
    def show(self, vlans):
        for vid in sorted(vlans):
            print(f"VLAN {vid:&gt;4}  {vlans[vid]}")
    def show_error(self, msg):
        print("ERROR:", msg)

class Controller:                               <span class="c"># CONTROLLER: dono ko jodta hai</span>
    def __init__(self, model, view):
        self.model = model
        self.view = view
    def handle_add(self, vid, name):
        try:
            self.model.add(vid, name)
            self.view.show(self.model.vlans)
        except ValueError as e:
            self.view.show_error(e)

app = Controller(VlanModel(), TextView())
app.handle_add(10, "USERS")
app.handle_add(20, "VOICE")
app.handle_add(5000, "BAD")</pre>
<pre class="out">VLAN   10  USERS
VLAN   10  USERS
VLAN   20  VOICE
<span class="hl">ERROR: bad VLAN id 5000</span></pre>
<p>Agar kal team ko text ki jagah HTML table chahiye, sirf view badalta hai. Agar VLAN limit ke rules badlein, sirf model badalta hai. Yahi separation poora point hai.</p>

<h3>MVC kahan milta hai</h3>
<p>Web frameworks (Django, Flask apps, Ruby on Rails) aur kai network tools ise use karte hain. Controller ka browser UI view hai; REST API handler controller hai; devices aur VLANs ka database model hai. Django mein wahi idea MTV (model, template, view) kehlata hai, par roles match karte hain.</p>
<div class="exam"><p><b>Exam trap.</b> Kaam ko letter se match karo. "Data store karta hai aur rules enforce karta hai" model hai. "Output render karta hai" view hai. "User input leta hai aur coordinate karta hai" controller hai. Jo view business rules chalaye, ya jo model HTML print kare, woh pattern todta hai. Ek aam distractor kehta hai ki controller data store karta hai.</p></div>
<p><b>MVC ke advantages.</b> Separation of concerns; ek hi model ko kai views dikha sakte hain (web page aur CLI report); teams parallel kaam kar sakti hain (front-end developer views par, back-end developer model par); aur har hissa alag se test ho sakta hai.</p>

<div class="scn"><h4>Wahi data, do screens</h4><p>Ek operations team ki VLAN report script mein database calls, validation aur print statements mile hue the. Manager ne web dashboard bhi maanga. Logic print code mein uljha hone se team copy karti, to dono copies alag ho jaati. Unhone rules ek model class mein daale aur do views banaye, ek text aur ek HTML. Agla rule change ek hi baar hua.</p><p><b>Lesson:</b> data aur rules ko display se alag rakho.</p></div>
<div class="iv"><p class="q">"MVC ko example se samjhao."</p><p>MVC application ko model (data aur business rules), view (presentation) aur controller (input leta hai aur baaki do ko coordinate karta hai) mein baantta hai. Example: VLAN manager mein model VLANs validate aur store karta hai, view table render karta hai, controller "add VLAN" requests handle karta hai. Advantages: separation of concerns, ek model ke kai views, aur independent testing aur teamwork.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design pattern ek naam wala, aazmaya hua, reusable solution hai, copy-paste code nahi.</li>
<li>Advantages: proven, shared vocabulary, tez design, maintainable, flexible.</li>
<li>MVC: Model = data aur rules, View = display, Controller = input aur coordination.</li>
<li>MVC se screen badal sakte ho rules ko chhue bina, aur har hissa alag test hota hai.</li>
<li>Jahan simple function kaafi ho wahan pattern mat thoso.</li>
</ul></div>
`}};export{e as default};