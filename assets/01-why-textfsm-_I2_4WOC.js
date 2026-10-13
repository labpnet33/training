var e={id:`why-textfsm`,h:{en:`Why hand-made parsing does not scale: meet TextFSM`,hi:`Haath se banaya parsing scale kyon nahi hota: TextFSM se milo`},body:{en:`
<p><b>What you will learn in this module.</b> A router answers a <code>show</code> command with text meant for human eyes. Automation needs rows and fields instead. By the end of this module you will be able to:</p>
<ul>
<li>explain why one-off <code>split()</code> and regex code breaks, and why a shared template fixes it;</li>
<li>read and write a <b>TextFSM template</b>: Values, states, rules and actions;</li>
<li>run a template from Python and get a list of rows or a list of dictionaries;</li>
<li>use the ready-made <b>ntc-templates</b> library and the <code>use_textfsm=True</code> shortcut of <code>nkmiko</code>;</li>
<li>write a template for a command nobody has parsed before, including wrapped and multi-line output;</li>
<li>test a template and find the cause when it returns the wrong rows.</li>
</ul>

<h3>Prerequisites</h3>
<p>Finish these modules first. <code>auto-py-basics</code> and <code>auto-py-data</code> (strings, lists, dictionaries, loops), <code>auto-py-func</code> (functions, files, <code>try</code>/<code>except</code>), <code>py-iter</code> (list comprehensions), <code>auto-formats</code> (JSON and dictionaries) and above all <code>auto-parse</code>, where you parsed <code>show</code> output with <code>split</code> and <code>re</code>. We build directly on that last one. Later modules reuse today's skill: <code>py-sqlite</code> stores parsed rows, <code>auto-ssh</code> collects output from many devices, and <code>py-pytest</code> tests your templates automatically.</p>

<h3>Analogy: the exam answer-sheet scanner</h3>
<p>Imagine marking 5,000 answer sheets by hand. Each marker would read the sheet slightly differently, and one tired marker would mix up two columns. Real exam boards instead print every sheet in the same layout and feed it to a <b>scanner</b> that knows where each field sits. The layout description is separate from the machine. Change the form, change the description, keep the machine.</p>
<p>TextFSM works the same way. The <b>text</b> is the answer sheet (the output of a command). The <b>template</b> is the layout description. The <b>TextFSM engine</b> is the scanner. It reads the text line by line and fills a table.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Raw show output goes through a template and the engine, and becomes rows">
<rect x="10" y="30" width="170" height="80" rx="10" fill="#bae6fd"/><text x="95" y="55" text-anchor="middle" class="svg-ink" font-size="13">Raw show output</text><text x="95" y="76" text-anchor="middle" class="svg-muted" font-size="11">text for humans</text><text x="95" y="94" text-anchor="middle" class="svg-muted" font-size="11">r1_ipbrief.txt</text>
<rect x="235" y="10" width="170" height="50" rx="10" fill="#fde68a"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Template</text><text x="320" y="49" text-anchor="middle" class="svg-muted" font-size="11">ipbrief.textfsm</text>
<rect x="235" y="75" width="170" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="13">TextFSM engine</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="11">import textfsm</text>
<rect x="460" y="30" width="170" height="80" rx="10" fill="#bbf7d0"/><text x="545" y="55" text-anchor="middle" class="svg-ink" font-size="13">Rows and fields</text><text x="545" y="76" text-anchor="middle" class="svg-muted" font-size="11">list of lists or dicts</text><text x="545" y="94" text-anchor="middle" class="svg-muted" font-size="11">ready for code</text>
<line x1="180" y1="70" x2="235" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="320" y2="75" stroke="#64748b" stroke-width="2"/><line x1="405" y1="100" x2="460" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The layout (template) is separate from the machine (engine). One engine, many templates.</p></div>

<h3>The problem: a split() that lies</h3>
<p>In <code>auto-parse</code> you split each line on spaces and took a field by position. Here is that idea on the file <code>r1_ipbrief.txt</code>, the saved output of <code>show ip interface brief</code> from router R1. The script <code>split_demo.py</code> prints the interface name and the field in position 4, which should be the status.</p>
<pre class="code">raw = open("r1_ipbrief.txt").read()

for line in raw.splitlines()[1:]:
    parts = line.split()
    print(parts[0], "-&gt;", parts[4])</pre>
<ul>
<li><code>open(...).read()</code> loads the whole file as one string.</li>
<li><code>splitlines()[1:]</code> makes a list of lines and skips the header line at position 0.</li>
<li><code>line.split()</code> cuts on any run of spaces. <code>parts[4]</code> is the fifth word.</li>
</ul>
<pre class="out">AUTO01$ python3 split_demo.py
GigabitEthernet0/0 -&gt; up
<span class="hl">GigabitEthernet0/1 -&gt; administratively</span>
<span class="hl">GigabitEthernet0/2 -&gt; administratively</span>
<span class="hl">GigabitEthernet0/3 -&gt; administratively</span>
Loopback0 -&gt; up</pre>
<p>The status of a shut interface is the <b>two words</b> "administratively down", so every position after it moves by one. The script does not crash. It quietly reports a wrong status, which is the worst kind of bug.</p>

<h3>Why this does not scale</h3>
<ul>
<li>Every engineer fixes the problem a little differently, so ten scripts give ten key names and ten bugs.</li>
<li>The parsing rules hide inside code. A colleague cannot read, test or reuse them without reading Python.</li>
<li>Every new command and every new IOS version means more <code>if</code> lines.</li>
</ul>
<p>With TextFSM the rules live in a small text file called a template. The fields are named, the pattern for each is visible, and the file can be tested on its own. A community library, <b>ntc-templates</b>, already holds hundreds of templates written and tested by other engineers.</p>

<h3>The two labs of this module</h3>
<table class="cmp"><tr><th>Lab</th><th>Where you work</th><th>What you do</th></tr>
<tr><td>Lab 1: Write a TextFSM template and use ntc-templates</td><td>AUTO01 (netadmin) and router R1 (10.99.0.1)</td><td>Run <code>collect.py</code>, write <code>ipbrief.textfsm</code>, use it from <code>notup.py</code>, then compare with ntc-templates in <code>ntc.py</code></td></tr>
<tr><td>Lab 2: Four templates that return the wrong rows</td><td>AUTO01 only</td><td>Use <code>check_templates.py</code> to find and repair four broken templates</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A change ticket says: "list every interface on R1 that is not up". With <code>split()</code> you write about ten fragile lines. With TextFSM you write one four-line template once, and the same ticket on 40 routers is a loop of three lines.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Trusting a script because it did not crash. Never counting the rows: a parser that returns 3 rows when the device has 5 interfaces fails silently. Copying a regex from the internet without testing it on a shut-down interface.</p></div>
<div class="exam"><p><b>Exam trap.</b> TextFSM does not connect to devices or run commands. It only turns text you already hold into rows. Collecting the text is a different job (<code>nkmiko</code> in this module, covered in depth in <code>auto-ssh</code>).</p></div>

<div class="scn"><h4>Ten scripts, ten answers</h4><p>A team audited "how many access ports are down" across a campus. Three engineers, three scripts, three different numbers, because each handled the two-word status in their own way. After one shared template was agreed and a test with a saved sample was added, all three scripts gave the same number and the audit was repeated every week without argument.</p><p><b>Lesson:</b> put the parsing rules in one shared, tested place instead of in every script.</p></div>

<div class="iv"><p class="q">"Why use TextFSM instead of regular expressions in your script?"</p><p>Regex inside code is hard to share and test. A TextFSM template names every field, keeps the pattern outside the code, supports states for multi-line output, and I can unit test it with a saved sample. The ntc-templates library gives me ready-made templates for common commands.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CLI output is text for humans; automation needs named fields and rows.</li>
<li>Splitting by position breaks when one value has two words, and it fails silently.</li>
<li>A TextFSM template (layout) is kept apart from the engine (scanner).</li>
<li>ntc-templates is a shared library of tested templates.</li>
<li>Always count the rows you get against the rows you expect.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Router <code>show</code> command ka jawab aisa text deta hai jo insaani aankhon ke liye hai. Automation ko rows aur fields chahiye. Is module ke ant tak aap yeh kar paoge:</p>
<ul>
<li>samjha paoge ki ek-baar ka <code>split()</code> aur regex code kyon toot'ta hai, aur shared template use theek kaise karta hai;</li>
<li><b>TextFSM template</b> padhna aur likhna: Values, states, rules aur actions;</li>
<li>Python se template chalana aur rows ki list ya dictionaries ki list lena;</li>
<li>ready-made <b>ntc-templates</b> library aur <code>nkmiko</code> ka <code>use_textfsm=True</code> shortcut use karna;</li>
<li>aisi command ke liye template likhna jise pehle kisi ne parse nahi kiya, wrapped aur multi-line output ke saath;</li>
<li>template test karna aur jab woh galat rows de to wajah dhoondhna.</li>
</ul>

<h3>Prerequisites</h3>
<p>Pehle yeh modules khatam karo. <code>auto-py-basics</code> aur <code>auto-py-data</code> (strings, lists, dictionaries, loops), <code>auto-py-func</code> (functions, files, <code>try</code>/<code>except</code>), <code>py-iter</code> (list comprehensions), <code>auto-formats</code> (JSON aur dictionaries) aur sabse zyada <code>auto-parse</code>, jahan aapne <code>show</code> output ko <code>split</code> aur <code>re</code> se parse kiya. Hum seedha usi par build karte hain. Aage ke modules aaj ki skill reuse karte hain: <code>py-sqlite</code> parsed rows store karta hai, <code>auto-ssh</code> bahut devices se output collect karta hai, aur <code>py-pytest</code> aapke templates ko apne aap test karta hai.</p>

<h3>Analogy: exam answer-sheet scanner</h3>
<p>Socho 5,000 answer sheets haath se check karni hain. Har checker sheet ko thoda alag padhega, aur ek thaka hua checker do columns mix kar dega. Asli exam boards har sheet ko same layout mein chhaapte hain aur ek <b>scanner</b> ko dete hain jo jaanta hai ki har field kahan hai. Layout ka description machine se alag hota hai. Form badla to description badlo, machine wahi rakho.</p>
<p>TextFSM bhi aise hi kaam karta hai. <b>Text</b> answer sheet hai (command ka output). <b>Template</b> layout ka description hai. <b>TextFSM engine</b> scanner hai. Woh text ko line by line padhta hai aur table bharta hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Kachcha show output template aur engine se guzarkar rows ban jaata hai">
<rect x="10" y="30" width="170" height="80" rx="10" fill="#bae6fd"/><text x="95" y="55" text-anchor="middle" class="svg-ink" font-size="13">Kachcha show output</text><text x="95" y="76" text-anchor="middle" class="svg-muted" font-size="11">insaan ke liye text</text><text x="95" y="94" text-anchor="middle" class="svg-muted" font-size="11">r1_ipbrief.txt</text>
<rect x="235" y="10" width="170" height="50" rx="10" fill="#fde68a"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Template</text><text x="320" y="49" text-anchor="middle" class="svg-muted" font-size="11">ipbrief.textfsm</text>
<rect x="235" y="75" width="170" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="13">TextFSM engine</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="11">import textfsm</text>
<rect x="460" y="30" width="170" height="80" rx="10" fill="#bbf7d0"/><text x="545" y="55" text-anchor="middle" class="svg-ink" font-size="13">Rows aur fields</text><text x="545" y="76" text-anchor="middle" class="svg-muted" font-size="11">lists ya dicts ki list</text><text x="545" y="94" text-anchor="middle" class="svg-muted" font-size="11">code ke liye taiyaar</text>
<line x1="180" y1="70" x2="235" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="320" y2="75" stroke="#64748b" stroke-width="2"/><line x1="405" y1="100" x2="460" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Layout (template) machine (engine) se alag hai. Ek engine, kai templates.</p></div>

<h3>Problem: split() jo jhooth bolta hai</h3>
<p><code>auto-parse</code> mein aapne har line ko spaces par split kiya aur position se field uthayi. Wahi idea yahan <code>r1_ipbrief.txt</code> file par hai, jo router R1 ke <code>show ip interface brief</code> ka saved output hai. Script <code>split_demo.py</code> interface ka naam aur position 4 ka field print karti hai, jo status hona chahiye.</p>
<pre class="code">raw = open("r1_ipbrief.txt").read()

for line in raw.splitlines()[1:]:
    parts = line.split()
    print(parts[0], "-&gt;", parts[4])</pre>
<ul>
<li><code>open(...).read()</code> poori file ko ek string ki tarah load karta hai.</li>
<li><code>splitlines()[1:]</code> lines ki list banata hai aur position 0 ki header line chhod deta hai.</li>
<li><code>line.split()</code> spaces ke kisi bhi run par kaatta hai. <code>parts[4]</code> paanchva shabd hai.</li>
</ul>
<pre class="out">AUTO01$ python3 split_demo.py
GigabitEthernet0/0 -&gt; up
<span class="hl">GigabitEthernet0/1 -&gt; administratively</span>
<span class="hl">GigabitEthernet0/2 -&gt; administratively</span>
<span class="hl">GigabitEthernet0/3 -&gt; administratively</span>
Loopback0 -&gt; up</pre>
<p>Shut interface ka status <b>do shabd</b> "administratively down" hai, isliye uske baad ki har position ek se khisak jaati hai. Script crash nahi hoti. Woh chupchaap galat status batati hai, jo sabse bura bug hota hai.</p>

<h3>Yeh scale kyon nahi hota</h3>
<ul>
<li>Har engineer problem ko thoda alag tarah se theek karta hai, isliye das scripts das key names aur das bugs dete hain.</li>
<li>Parsing rules code ke andar chhupe hote hain. Colleague Python padhe bina unhe padh, test ya reuse nahi kar sakta.</li>
<li>Har nayi command aur har naye IOS version ka matlab aur <code>if</code> lines.</li>
</ul>
<p>TextFSM mein rules ek chhoti text file mein rehte hain jise template kehte hain. Fields ke naam hote hain, har ka pattern dikhta hai, aur file ko alag se test kiya ja sakta hai. Ek community library, <b>ntc-templates</b>, mein doosre engineers ke likhe aur test kiye hue saikdon templates pehle se hain.</p>

<h3>Is module ki do labs</h3>
<table class="cmp"><tr><th>Lab</th><th>Kahan kaam hoga</th><th>Kya karoge</th></tr>
<tr><td>Lab 1: TextFSM template likho aur ntc-templates use karo</td><td>AUTO01 (netadmin) aur router R1 (10.99.0.1)</td><td><code>collect.py</code> chalao, <code>ipbrief.textfsm</code> likho, use <code>notup.py</code> se use karo, phir <code>ntc.py</code> mein ntc-templates se compare karo</td></tr>
<tr><td>Lab 2: Chaar templates jo galat rows dete hain</td><td>sirf AUTO01</td><td><code>check_templates.py</code> se chaar toote templates dhoondho aur repair karo</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Change ticket kehta hai: "R1 ke har woh interface ki list do jo up nahi hai". <code>split()</code> se aap lagbhag das nazuk lines likhte ho. TextFSM se chaar line ka ek template ek baar likhte ho, aur 40 routers par wahi ticket teen line ka loop hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Script par bharosa karna kyunki woh crash nahi hui. Rows kabhi na ginna: jo parser 5 interfaces wale device par 3 rows de, woh chupchaap fail hota hai. Internet se regex copy karke shut-down interface par test na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> TextFSM devices se connect nahi karta aur commands nahi chalata. Woh sirf us text ko rows banata hai jo aapke paas pehle se hai. Text collect karna alag kaam hai (is module mein <code>nkmiko</code>, <code>auto-ssh</code> mein gehraai se).</p></div>

<div class="scn"><h4>Das scripts, das jawab</h4><p>Ek team ne campus mein audit kiya: "kitne access ports down hain". Teen engineers, teen scripts, teen alag numbers, kyunki sabne do shabd wale status ko apne tareeke se handle kiya. Ek shared template tay hone aur saved sample ke saath test jodne ke baad teeno scripts ne wahi number diya, aur audit har hafte bina behas ke dohraya gaya.</p><p><b>Lesson:</b> parsing rules ko har script mein rakhne ki jagah ek shared, tested jagah par rakho.</p></div>

<div class="iv"><p class="q">"Script mein regular expressions ki jagah TextFSM kyon use karte ho?"</p><p>Code ke andar regex ko share aur test karna mushkil hai. TextFSM template har field ko naam deta hai, pattern ko code se bahar rakhta hai, multi-line output ke liye states deta hai, aur main saved sample se use unit test kar sakta hoon. ntc-templates library common commands ke liye ready-made templates deti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CLI output insaan ke liye text hai; automation ko naam wale fields aur rows chahiye.</li>
<li>Position se split karna tab toot'ta hai jab ek value do shabd ki ho, aur woh chupchaap fail hota hai.</li>
<li>TextFSM template (layout) engine (scanner) se alag rehta hai.</li>
<li>ntc-templates tested templates ki shared library hai.</li>
<li>Jitni rows mili unhe hamesha expected rows se ginke milao.</li>
</ul></div>
`}};export{e as default};