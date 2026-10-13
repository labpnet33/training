var e={id:`placeholders`,h:{en:`Placeholders: {{ }} and passing data in`,hi:`Placeholders: {{ }} aur data pass karna`},body:{en:`
<p><b>The idea of this chapter:</b> the double curly braces <code>{{ }}</code> are the blanks of your template. You will learn how to name them, how data reaches them, and how to read a value that lives inside a dictionary.</p>

<h3>Analogy: the label on a luggage tag</h3>
<p>A luggage tag has printed boxes: NAME, FLIGHT, SEAT. The printer puts the real values in the boxes. The tag layout never changes; only the values do. In a template the printed box is <code>{{ name }}</code> and the values come from your Python data.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Values flow from Python into the template blanks">
<rect x="20" y="30" width="260" height="110" rx="10" fill="#bae6fd"/><text x="150" y="52" text-anchor="middle" class="svg-ink" font-size="13">Python data</text>
<text x="150" y="78" text-anchor="middle" class="svg-muted" font-size="12">port = "GigabitEthernet0/2"</text><text x="150" y="98" text-anchor="middle" class="svg-muted" font-size="12">desc = "USER-1"</text><text x="150" y="118" text-anchor="middle" class="svg-muted" font-size="12">vlan = 10</text>
<line x1="280" y1="85" x2="350" y2="85" stroke="#64748b" stroke-width="2"/><text x="315" y="75" text-anchor="middle" class="svg-accent" font-size="12">render()</text>
<rect x="350" y="30" width="270" height="110" rx="10" fill="#fde68a"/><text x="485" y="52" text-anchor="middle" class="svg-ink" font-size="13">Template</text>
<text x="485" y="78" text-anchor="middle" class="svg-muted" font-size="12">interface {{ port }}</text><text x="485" y="98" text-anchor="middle" class="svg-muted" font-size="12"> description {{ desc }}</text><text x="485" y="118" text-anchor="middle" class="svg-muted" font-size="12"> switchport access vlan {{ vlan }}</text>
</svg><p class="cap">The names in the braces must match the names you pass to render().</p></div>

<h3>Several values at once</h3>
<p>Your template text can be several lines. Jinja2 keeps every line break exactly as typed. The script <code>t2.py</code>:</p>
<pre class="code">from jinja2 import Template

text = """interface {{ port }}
 description {{ desc }}
 switchport access vlan {{ vlan }}"""
template = Template(text)
print(template.render(port="GigabitEthernet0/2", desc="USER-1", vlan=10))</pre>
<pre class="out">AUTO01$ python3 t2.py
interface GigabitEthernet0/2
 description USER-1
 switchport access vlan 10</pre>
<ul>
<li>Triple quotes <code>"""..."""</code> let a Python string span several lines. The space before <code>description</code> is part of the text and becomes the IOS indent.</li>
<li><code>render(port=..., desc=..., vlan=...)</code> passes <b>keyword arguments</b>: the word before <code>=</code> is the name the template uses.</li>
<li>Numbers are fine: <code>vlan=10</code> prints as <code>10</code>.</li>
</ul>

<h3>Reading inside a dictionary</h3>
<p>Real data is rarely one value at a time. A switch is a dictionary: a hostname, a management address, a port list. You pass the whole dictionary and reach inside with a <b>dot</b> or with square brackets.</p>
<pre class="code">from jinja2 import Template

data = {"sw": {"hostname": "PUN-ACC-SW1", "mgmt_ip": "10.99.0.11"}}
template = Template("hostname {{ sw.hostname }}\\nip address {{ sw['mgmt_ip'] }}")
print(template.render(**data))</pre>
<pre class="out">AUTO01$ python3 t3.py
hostname PUN-ACC-SW1
ip address 10.99.0.11</pre>
<ul>
<li><code>{{ sw.hostname }}</code> and <code>{{ sw['mgmt_ip'] }}</code> do the same kind of lookup. The dot is shorter and the usual choice in templates; brackets are needed when a key has a dash or space.</li>
<li><code>**data</code> unpacks the dictionary so each key becomes a keyword argument. It is the same as writing <code>render(sw={...})</code>.</li>
<li>The characters <code>\\n</code> inside a normal quoted string mean "new line".</li>
</ul>

<h3>What a blank looks like when the value is missing</h3>
<p>If the template mentions a name you never passed, Jinja2 does <b>not</b> complain by default. It prints nothing:</p>
<pre class="code"># blank.py
from jinja2 import Template

print(Template("[{{ x }}]").render())</pre>
<pre class="out">AUTO01$ python3 blank.py
<span class="hl">[]</span></pre>
<p>That silence is dangerous in a config: <code>ip address  255.255.255.0</code> with an empty address is not an error until the device rejects it. Chapter 8 shows how to turn that silence into an error.</p>

<div class="eg"><p><b>Worked example.</b> A branch router needs <code>hostname BLR-BR-R1</code>. The template line is <code>hostname {{ site.hostname }}</code>. The data is <code>{"hostname": "BLR-BR-R1"}</code> passed as <code>site=...</code>. If you mis-spell it as <code>{{ site.hostnme }}</code>, the config will contain <code>hostname </code> with nothing after it, and no Python error appears.</p></div>

<div class="warn"><p><b>Common mistakes.</b> A template name that does not match the keyword: <code>{{ host }}</code> in the template but <code>hostname=...</code> in the call. Using one curly brace instead of two. Putting spaces or dashes in a name and then using the dot form. Forgetting that a dictionary key is case sensitive: <code>Hostname</code> is not <code>hostname</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> In templates, <code>{{ ... }}</code> <i>prints</i> a value. <code>{% ... %}</code> controls logic (next chapters). <code>{# ... #}</code> is a comment that does not appear in the output. Do not mix the three.</p></div>

<div class="scn"><h4>The config with an empty address</h4><p>A new engineer renamed a CSV column from <code>mgmt_ip</code> to <code>mgmt</code> but left the template with <code>{{ sw.mgmt_ip }}</code>. The render finished without any error and every file contained <code>ip address  255.255.255.0</code>. The error only showed up on the switch during the push. A review of one rendered file before pushing would have exposed it in seconds.</p><p><b>Lesson:</b> names in the template and in the data must match exactly, and you must read at least one rendered output before sending anything to a device.</p></div>

<div class="iv"><p class="q">"How does data get into a Jinja2 template?"</p><p>You pass it to <code>render()</code> as keyword arguments or as a dictionary unpacked with <code>**</code>. Inside the template, <code>{{ name }}</code> prints a value and <code>{{ sw.hostname }}</code> reads a key inside a dictionary. Add that by default a missing variable renders as empty text, so production pipelines enable <code>StrictUndefined</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>{{ name }}</code> is a blank; <code>render(name=value)</code> fills it.</li>
<li>Triple-quoted strings hold multi-line templates; spaces inside them are kept.</li>
<li>Read dictionary values with <code>{{ sw.hostname }}</code> or <code>{{ sw['mgmt_ip'] }}</code>.</li>
<li><code>render(**data)</code> unpacks a dictionary into keyword arguments.</li>
<li>A missing variable prints as empty text unless you make it an error.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> double curly braces <code>{{ }}</code> aapke template ke blanks hain. Aap seekhoge unhe naam kaise dete hain, data unke paas kaise pahunchta hai, aur dictionary ke andar rakhi value kaise padhte hain.</p>

<h3>Analogy: luggage tag ka label</h3>
<p>Luggage tag par chhape hue boxes hote hain: NAME, FLIGHT, SEAT. Printer boxes mein asli values daalta hai. Tag ka layout kabhi nahi badalta; sirf values badalti hain. Template mein chhapa box <code>{{ name }}</code> hai aur values aapke Python data se aati hain.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Python se values template ke blanks mein jaati hain">
<rect x="20" y="30" width="260" height="110" rx="10" fill="#bae6fd"/><text x="150" y="52" text-anchor="middle" class="svg-ink" font-size="13">Python data</text>
<text x="150" y="78" text-anchor="middle" class="svg-muted" font-size="12">port = "GigabitEthernet0/2"</text><text x="150" y="98" text-anchor="middle" class="svg-muted" font-size="12">desc = "USER-1"</text><text x="150" y="118" text-anchor="middle" class="svg-muted" font-size="12">vlan = 10</text>
<line x1="280" y1="85" x2="350" y2="85" stroke="#64748b" stroke-width="2"/><text x="315" y="75" text-anchor="middle" class="svg-accent" font-size="12">render()</text>
<rect x="350" y="30" width="270" height="110" rx="10" fill="#fde68a"/><text x="485" y="52" text-anchor="middle" class="svg-ink" font-size="13">Template</text>
<text x="485" y="78" text-anchor="middle" class="svg-muted" font-size="12">interface {{ port }}</text><text x="485" y="98" text-anchor="middle" class="svg-muted" font-size="12"> description {{ desc }}</text><text x="485" y="118" text-anchor="middle" class="svg-muted" font-size="12"> switchport access vlan {{ vlan }}</text>
</svg><p class="cap">Braces ke andar ke naam render() ko diye naamon se match hone chahiye.</p></div>

<h3>Ek saath kai values</h3>
<p>Template text kai lines ka ho sakta hai. Jinja2 har line break ko bilkul waisa hi rakhta hai jaisa type kiya. Script <code>t2.py</code>:</p>
<pre class="code">from jinja2 import Template

text = """interface {{ port }}
 description {{ desc }}
 switchport access vlan {{ vlan }}"""
template = Template(text)
print(template.render(port="GigabitEthernet0/2", desc="USER-1", vlan=10))</pre>
<pre class="out">AUTO01$ python3 t2.py
interface GigabitEthernet0/2
 description USER-1
 switchport access vlan 10</pre>
<ul>
<li>Triple quotes <code>"""..."""</code> Python string ko kai lines mein failne dete hain. <code>description</code> se pehle ka space text ka hissa hai aur IOS ka indent ban jaata hai.</li>
<li><code>render(port=..., desc=..., vlan=...)</code> <b>keyword arguments</b> pass karta hai: <code>=</code> se pehle ka word woh naam hai jo template use karta hai.</li>
<li>Numbers theek hain: <code>vlan=10</code> <code>10</code> ki tarah print hota hai.</li>
</ul>

<h3>Dictionary ke andar padhna</h3>
<p>Asli data shayad hi kabhi ek-ek value mein hota hai. Ek switch dictionary hai: hostname, management address, port list. Aap poori dictionary pass karte ho aur <b>dot</b> ya square brackets se andar pahunchte ho.</p>
<pre class="code">from jinja2 import Template

data = {"sw": {"hostname": "PUN-ACC-SW1", "mgmt_ip": "10.99.0.11"}}
template = Template("hostname {{ sw.hostname }}\\nip address {{ sw['mgmt_ip'] }}")
print(template.render(**data))</pre>
<pre class="out">AUTO01$ python3 t3.py
hostname PUN-ACC-SW1
ip address 10.99.0.11</pre>
<ul>
<li><code>{{ sw.hostname }}</code> aur <code>{{ sw['mgmt_ip'] }}</code> ek jaisa lookup karte hain. Dot chhota hai aur templates mein aam choice; brackets tab chahiye jab key mein dash ya space ho.</li>
<li><code>**data</code> dictionary ko unpack karta hai taaki har key keyword argument ban jaaye. Yeh <code>render(sw={...})</code> likhne jaisa hi hai.</li>
<li>Normal quoted string ke andar <code>\\n</code> characters ka matlab "nayi line".</li>
</ul>

<h3>Value missing ho to blank kaisa dikhta hai</h3>
<p>Template mein aisa naam ho jo aapne pass nahi kiya, to Jinja2 default mein shikayat <b>nahi</b> karta. Woh kuch print nahi karta:</p>
<pre class="code"># blank.py
from jinja2 import Template

print(Template("[{{ x }}]").render())</pre>
<pre class="out">AUTO01$ python3 blank.py
<span class="hl">[]</span></pre>
<p>Config mein yeh chuppi khatarnak hai: khaali address wali <code>ip address  255.255.255.0</code> tab tak error nahi hoti jab tak device use reject na kare. Chapter 8 dikhata hai ki is chuppi ko error kaise banate hain.</p>

<div class="eg"><p><b>Worked example.</b> Branch router ko <code>hostname BLR-BR-R1</code> chahiye. Template line <code>hostname {{ site.hostname }}</code> hai. Data <code>{"hostname": "BLR-BR-R1"}</code> hai jo <code>site=...</code> ke roop mein pass hota hai. Agar aap use <code>{{ site.hostnme }}</code> galat spell karo, to config mein <code>hostname </code> aayega aur uske baad kuch nahi, aur koi Python error nahi dikhega.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Template ka naam keyword se match na hona: template mein <code>{{ host }}</code> par call mein <code>hostname=...</code>. Do ki jagah ek curly brace. Naam mein space ya dash daal kar dot form use karna. Bhoolna ki dictionary key case sensitive hai: <code>Hostname</code> aur <code>hostname</code> alag hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Templates mein <code>{{ ... }}</code> value <i>print</i> karta hai. <code>{% ... %}</code> logic control karta hai (agle chapters). <code>{# ... #}</code> comment hai jo output mein nahi aata. Teeno ko mix mat karo.</p></div>

<div class="scn"><h4>Khaali address wali config</h4><p>Ek naye engineer ne CSV column <code>mgmt_ip</code> ko <code>mgmt</code> naam diya par template mein <code>{{ sw.mgmt_ip }}</code> rehne diya. Render bina kisi error ke khatam hua aur har file mein <code>ip address  255.255.255.0</code> tha. Error sirf push ke waqt switch par dikha. Push se pehle ek rendered file ka review use seconds mein pakad leta.</p><p><b>Lesson:</b> template aur data ke naam bilkul match karne chahiye, aur kisi device par kuch bhejne se pehle kam se kam ek rendered output padho.</p></div>

<div class="iv"><p class="q">"Jinja2 template mein data kaise aata hai?"</p><p>Aap use <code>render()</code> ko keyword arguments ki tarah ya <code>**</code> se unpack ki hui dictionary ki tarah dete ho. Template ke andar <code>{{ name }}</code> value print karta hai aur <code>{{ sw.hostname }}</code> dictionary ke andar ki key padhta hai. Jodo ki default mein missing variable khaali text render hota hai, isliye production pipelines <code>StrictUndefined</code> enable karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>{{ name }}</code> blank hai; <code>render(name=value)</code> use bharta hai.</li>
<li>Triple-quoted strings multi-line templates rakhte hain; unke andar ke spaces bache rehte hain.</li>
<li>Dictionary values <code>{{ sw.hostname }}</code> ya <code>{{ sw['mgmt_ip'] }}</code> se padho.</li>
<li><code>render(**data)</code> dictionary ko keyword arguments mein unpack karta hai.</li>
<li>Missing variable khaali text print karta hai jab tak use error na banao.</li>
</ul></div>
`}};export{e as default};