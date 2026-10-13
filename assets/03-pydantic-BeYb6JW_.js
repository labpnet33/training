var e={id:`pydantic`,h:{en:`pydantic: models that validate`,hi:`pydantic: models jo validate karte hain`},body:{en:`
<p>A <b>pydantic model</b> is a form with rules. Each box has a name, a type and limits; filling the form in either gives you a clean object or a report that lists <i>every</i> box that is wrong. FastAPI uses models for everything that crosses the door of your API, in both directions. You build the first two in step 1 of Lab 1.</p>
<div class="dia"><svg viewBox="0 0 640 84" role="img" aria-label="From raw data to a checked object"><rect x="8" y="12" width="191" height="60" rx="10" fill="#bae6fd"/><text x="103" y="40" text-anchor="middle" class="svg-ink" font-size="13">Incoming data</text><text x="103" y="57" text-anchor="middle" class="svg-muted" font-size="11">dict or JSON</text><line x1="199" y1="42" x2="225" y2="42" stroke="#64748b" stroke-width="2"/><polygon points="225,42 218,38 218,46" fill="#64748b"/><rect x="225" y="12" width="191" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">pydantic model</text><text x="320" y="57" text-anchor="middle" class="svg-muted" font-size="11">types, limits</text><line x1="415" y1="42" x2="441" y2="42" stroke="#64748b" stroke-width="2"/><polygon points="441,42 434,38 434,46" fill="#64748b"/><rect x="441" y="12" width="191" height="60" rx="10" fill="#fde68a"/><text x="537" y="40" text-anchor="middle" class="svg-ink" font-size="13">Valid object</text><text x="537" y="57" text-anchor="middle" class="svg-muted" font-size="11">safe to use</text></svg></div>
<h3>The first models</h3>
<p><code>InterfaceOut</code> is what the API will <b>return</b> for one interface. <code>DescriptionIn</code> is what a client may <b>send</b> when it wants to change a description: the interface must match a pattern, the description must be 3 to 40 characters made of letters, digits and a few separators.</p>
<pre class="code">"""models.py - the shapes of our API: what goes out and what comes in"""
from pydantic import BaseModel, Field


class InterfaceOut(BaseModel):
    interface: str
    ip_address: str
    status: str
    proto: str


class DescriptionIn(BaseModel):
    interface: str = Field(pattern=r"^(GigabitEthernet|Loopback)\\d+(/\\d+)*$")
    description: str = Field(min_length=3, max_length=40, pattern=r"^[A-Za-z0-9 ._:/-]+$")</pre><pre class="code">from pydantic import ValidationError

from models import DescriptionIn

good = DescriptionIn(interface="GigabitEthernet0/1", description="TO-BLR-CORE")
print(good)
print(good.model_dump())
try:
    DescriptionIn(interface="Fa0/1", description="x")
except ValidationError as err:
    print(err.error_count(), "validation errors")
    for e in err.errors():
        print("  ", e["loc"][0], "-", e["type"])</pre><pre class="out">AUTO01$ python3 check_models.py
interface='GigabitEthernet0/1' description='TO-BLR-CORE'
{'interface': 'GigabitEthernet0/1', 'description': 'TO-BLR-CORE'}
<span class="hl">2 validation errors</span>
   interface - string_pattern_mismatch
   description - string_too_short</pre>
<p>The bad payload breaks two rules and pydantic reports <b>both</b>, not just the first. That is the difference between a form check and a script that crashes at the first problem. Each error has a <code>loc</code> (where), a <code>type</code> (which rule) and a <code>msg</code> (human text). <code>model_dump()</code> turns the object back into a dictionary.</p>

<h3>Rules you will use every day</h3>
<table class="cmp"><tr><th>Rule</th><th>Meaning</th><th>Error type</th></tr>
<tr><td><code>ge=1, le=4094</code></td><td>number range</td><td><code>greater_than_equal</code>, <code>less_than_equal</code></td></tr>
<tr><td><code>min_length / max_length</code></td><td>string or list size</td><td><code>string_too_short</code>, <code>string_too_long</code></td></tr>
<tr><td><code>pattern=r"..."</code></td><td>regular expression</td><td><code>string_pattern_mismatch</code></td></tr>
<tr><td>no default</td><td>field is required</td><td><code>missing</code></td></tr>
<tr><td><code>extra="forbid"</code></td><td>unknown keys refused</td><td><code>extra_forbidden</code></td></tr></table>
<pre class="code">from pydantic import BaseModel, Field, ValidationError, ConfigDict


class Vlan(BaseModel):
    model_config = ConfigDict(extra="forbid")
    vlan_id: int = Field(ge=1, le=4094)
    name: str = Field(min_length=1, max_length=32)
    active: bool = True
    ports: list[str] = []


v = Vlan(vlan_id="20", name="USERS", active="yes")
print(v)
print(repr(v.vlan_id), v.active)
print(v.model_dump())
print(v.model_dump_json())
print(Vlan.model_validate({"vlan_id": 30, "name": "VOICE"}).ports)
print(Vlan.model_validate_json('{"vlan_id": 40, "name": "MGMT", "ports": ["Gi0/1"]}'))
for bad in ({"vlan_id": 5000, "name": "X"}, {"vlan_id": "ten", "name": 5}, {"name": "X", "colour": "red"}):
    try:
        Vlan.model_validate(bad)
    except ValidationError as err:
        print(err.error_count(), [(e["loc"], e["type"]) for e in err.errors()])</pre><pre class="out">AUTO01$ python3 types1.py
vlan_id=20 name='USERS' active=True ports=[]
<span class="hl">20 True</span>
{'vlan_id': 20, 'name': 'USERS', 'active': True, 'ports': []}
{"vlan_id":20,"name":"USERS","active":true,"ports":[]}
[]
vlan_id=40 name='MGMT' active=True ports=['Gi0/1']
1 [(('vlan_id',), 'less_than_equal')]
<span class="hl">2 [(('vlan_id',), 'int_parsing'), (('name',), 'string_type')]</span>
2 [(('vlan_id',), 'missing'), (('colour',), 'extra_forbidden')]</pre>
<p>Three things to see. First, pydantic is <b>lax by default</b>: the string <code>"20"</code> became the integer <code>20</code> and <code>"yes"</code> became <code>True</code>, because that is how data arrives from JSON, forms and query strings. A value that cannot be converted (<code>"ten"</code>, or the number 5 for a string field) is an error. Second, <code>model_validate</code> and <code>model_validate_json</code> build a model from a dictionary or a JSON text. Third, the defaults <code>True</code> and <code>[]</code> filled the missing boxes; each object gets its own copy of the list.</p>

<h3>Your own checks and secret values</h3>
<pre class="code">from ipaddress import ip_address

from pydantic import BaseModel, Field, ValidationError, field_validator


class Peer(BaseModel):
    name: str
    ip: str
    asn: int = Field(gt=0, lt=4294967296)

    @field_validator("ip")
    @classmethod
    def must_be_ip(cls, v):
        ip_address(v)
        return v

    @field_validator("name")
    @classmethod
    def tidy(cls, v):
        return v.strip().upper()


print(Peer(name="  isp-a ", ip="203.0.113.1", asn=64500))
try:
    Peer(name="x", ip="203.0.113.999", asn=0)
except ValidationError as err:
    print(err)</pre><pre class="out">AUTO01$ python3 peer.py
name='ISP-A' ip='203.0.113.1' asn=64500
<span class="hl">2 validation errors for Peer</span>
ip
  Value error, '203.0.113.999' does not appear to be an IPv4 or IPv6 address [type=value_error, input_value='203.0.113.999', input_type=str]
    For further information visit ht&#116;ps://errors.pydantic.dev/2.7/v/value_error
asn
  Input should be greater than 0 [type=greater_than, input_value=0, input_type=int]
    For further information visit ht&#116;ps://errors.pydantic.dev/2.7/v/greater_than</pre>
<p>A <code>field_validator</code> runs after the type check. It can reject a value (an impossible IP address) or tidy it (strip and upper-case the name). The long message is what <code>print(err)</code> shows; the <code>errors()</code> list is the same information as data.</p>
<pre class="code">from pydantic import BaseModel, SecretStr


class Login(BaseModel):
    user: str
    password: SecretStr


login = Login(user="netops", password="NK@2026")
print(login)
print(repr(login.password), login.password.get_secret_value())
print(login.model_dump_json())</pre><pre class="out">AUTO01$ python3 secret.py
<span class="hl">user='netops' password=SecretStr('**********')</span>
<span class="hl">SecretStr('**********') NK@2026</span>
{"user":"netops","password":"**********"}</pre>
<p><code>SecretStr</code> hides the value in <code>repr</code>, in logs and in <code>model_dump_json()</code>; only <code>get_secret_value()</code> reveals it. Use it for any password or token that lives in a model.</p>
<div class="note"><p><b>In the lab vs on real systems.</b> The lab runs a pure-Python version of pydantic 2.7 with the same error types, messages and method names. The real library has a compiled core and many more types; the extra line "For further information visit ..." comes from there too. Nothing in this chapter changes on a real machine.</p></div>

<div class="warn"><p><b>Common mistake.</b> Writing <code>vlan: Optional[int]</code> and believing the field is now optional. In pydantic v2 it only <i>allows</i> <code>None</code>; without a default (<code>= None</code>) the field is still required.</p></div>
<div class="exam"><p><b>Exam trap.</b> Version 2 names: <code>model_dump()</code> (not <code>dict()</code>), <code>model_validate()</code> (not <code>parse_obj</code>), <code>field_validator</code> (not <code>validator</code>), <code>Field(pattern=...)</code> (not <code>regex=</code>).</p></div>

<div class="scn"><h4>The description with a second command inside</h4><p>A change tool built its configuration lines with plain string formatting and no checks. Someone pasted a description copied from a spreadsheet; it contained a line break followed by the word <code>shutdown</code>. The tool sent both lines and the interface went down. A <code>pattern</code> on the field (letters, digits, space and a few separators, no line breaks) would have refused the request before any device was touched.</p><p><b>Lesson:</b> a model is also a security control; describe what is allowed, not what is forbidden.</p></div>

<div class="iv"><p class="q">"What does pydantic give you over validating a dictionary by hand?"</p><p>Declarative rules in one place, automatic type conversion, and an error report that lists every problem with its location and rule. The same model feeds FastAPI's request parsing, the response filter and the OpenAPI document. I would add that it is lax by default, so I switch on strict mode or add validators where silent conversion would hide a mistake.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A model is a typed form; <code>Field(...)</code> adds limits and patterns.</li>
<li><code>ValidationError</code> lists every problem with <code>loc</code>, <code>type</code> and <code>msg</code>.</li>
<li>Pydantic converts compatible values ("20" to 20) and rejects the rest.</li>
<li><code>field_validator</code> adds your own rules; <code>SecretStr</code> hides secrets.</li>
<li>A pattern on input fields stops commands from sneaking into device configuration.</li>
</ul></div>
`,hi:`
<p><b>Pydantic model</b> rules wala form hai. Har box ka naam, type aur limits hote hain; form bharne par ya to saaf object milta hai ya aisi report jo <i>har</i> galat box list karti hai. FastAPI apne API ke darwaze se guzarne wali har cheez ke liye models use karta hai, dono directions mein. Pehle do models aap Lab 1 ke step 1 mein banate ho.</p>
<div class="dia"><svg viewBox="0 0 640 84" role="img" aria-label="Kachche data se checked object tak"><rect x="8" y="12" width="191" height="60" rx="10" fill="#bae6fd"/><text x="103" y="40" text-anchor="middle" class="svg-ink" font-size="13">Aata data</text><text x="103" y="57" text-anchor="middle" class="svg-muted" font-size="11">dict ya JSON</text><line x1="199" y1="42" x2="225" y2="42" stroke="#64748b" stroke-width="2"/><polygon points="225,42 218,38 218,46" fill="#64748b"/><rect x="225" y="12" width="191" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">pydantic model</text><text x="320" y="57" text-anchor="middle" class="svg-muted" font-size="11">types, limits</text><line x1="415" y1="42" x2="441" y2="42" stroke="#64748b" stroke-width="2"/><polygon points="441,42 434,38 434,46" fill="#64748b"/><rect x="441" y="12" width="191" height="60" rx="10" fill="#fde68a"/><text x="537" y="40" text-anchor="middle" class="svg-ink" font-size="13">Valid object</text><text x="537" y="57" text-anchor="middle" class="svg-muted" font-size="11">use karna safe</text></svg></div>
<h3>Pehle models</h3>
<p><code>InterfaceOut</code> woh hai jo API ek interface ke liye <b>lautayegi</b>. <code>DescriptionIn</code> woh hai jo client description badalne ke liye <b>bhej</b> sakta hai: interface ek pattern se match kare, description 3 se 40 characters ki ho aur letters, digits aur kuch separators se bani ho.</p>
<pre class="code">"""models.py - the shapes of our API: what goes out and what comes in"""
from pydantic import BaseModel, Field


class InterfaceOut(BaseModel):
    interface: str
    ip_address: str
    status: str
    proto: str


class DescriptionIn(BaseModel):
    interface: str = Field(pattern=r"^(GigabitEthernet|Loopback)\\d+(/\\d+)*$")
    description: str = Field(min_length=3, max_length=40, pattern=r"^[A-Za-z0-9 ._:/-]+$")</pre><pre class="code">from pydantic import ValidationError

from models import DescriptionIn

good = DescriptionIn(interface="GigabitEthernet0/1", description="TO-BLR-CORE")
print(good)
print(good.model_dump())
try:
    DescriptionIn(interface="Fa0/1", description="x")
except ValidationError as err:
    print(err.error_count(), "validation errors")
    for e in err.errors():
        print("  ", e["loc"][0], "-", e["type"])</pre><pre class="out">AUTO01$ python3 check_models.py
interface='GigabitEthernet0/1' description='TO-BLR-CORE'
{'interface': 'GigabitEthernet0/1', 'description': 'TO-BLR-CORE'}
<span class="hl">2 validation errors</span>
   interface - string_pattern_mismatch
   description - string_too_short</pre>
<p>Galat payload do rules todta hai aur pydantic <b>dono</b> report karta hai, sirf pehla nahi. Form check aur us script mein yahi farq hai jo pehli problem par crash ho jaati hai. Har error mein <code>loc</code> (kahan), <code>type</code> (kaunsa rule) aur <code>msg</code> (insaani text) hota hai. <code>model_dump()</code> object ko wapas dictionary bana deta hai.</p>

<h3>Rozmarra ke rules</h3>
<table class="cmp"><tr><th>Rule</th><th>Matlab</th><th>Error type</th></tr>
<tr><td><code>ge=1, le=4094</code></td><td>number ki range</td><td><code>greater_than_equal</code>, <code>less_than_equal</code></td></tr>
<tr><td><code>min_length / max_length</code></td><td>string ya list ka size</td><td><code>string_too_short</code>, <code>string_too_long</code></td></tr>
<tr><td><code>pattern=r"..."</code></td><td>regular expression</td><td><code>string_pattern_mismatch</code></td></tr>
<tr><td>default nahi</td><td>field zaroori hai</td><td><code>missing</code></td></tr>
<tr><td><code>extra="forbid"</code></td><td>unknown keys refuse</td><td><code>extra_forbidden</code></td></tr></table>
<pre class="code">from pydantic import BaseModel, Field, ValidationError, ConfigDict


class Vlan(BaseModel):
    model_config = ConfigDict(extra="forbid")
    vlan_id: int = Field(ge=1, le=4094)
    name: str = Field(min_length=1, max_length=32)
    active: bool = True
    ports: list[str] = []


v = Vlan(vlan_id="20", name="USERS", active="yes")
print(v)
print(repr(v.vlan_id), v.active)
print(v.model_dump())
print(v.model_dump_json())
print(Vlan.model_validate({"vlan_id": 30, "name": "VOICE"}).ports)
print(Vlan.model_validate_json('{"vlan_id": 40, "name": "MGMT", "ports": ["Gi0/1"]}'))
for bad in ({"vlan_id": 5000, "name": "X"}, {"vlan_id": "ten", "name": 5}, {"name": "X", "colour": "red"}):
    try:
        Vlan.model_validate(bad)
    except ValidationError as err:
        print(err.error_count(), [(e["loc"], e["type"]) for e in err.errors()])</pre><pre class="out">AUTO01$ python3 types1.py
vlan_id=20 name='USERS' active=True ports=[]
<span class="hl">20 True</span>
{'vlan_id': 20, 'name': 'USERS', 'active': True, 'ports': []}
{"vlan_id":20,"name":"USERS","active":true,"ports":[]}
[]
vlan_id=40 name='MGMT' active=True ports=['Gi0/1']
1 [(('vlan_id',), 'less_than_equal')]
<span class="hl">2 [(('vlan_id',), 'int_parsing'), (('name',), 'string_type')]</span>
2 [(('vlan_id',), 'missing'), (('colour',), 'extra_forbidden')]</pre>
<p>Teen cheezein dekho. Pehli, pydantic by default <b>lax</b> hai: string <code>"20"</code> integer <code>20</code> ban gayi aur <code>"yes"</code> <code>True</code>, kyunki JSON, forms aur query strings mein data aise hi aata hai. Jo value convert nahi ho sakti (<code>"ten"</code>, ya string field ke liye number 5) woh error hai. Doosri, <code>model_validate</code> aur <code>model_validate_json</code> dictionary ya JSON text se model banate hain. Teesri, defaults <code>True</code> aur <code>[]</code> ne missing boxes bhar diye; har object ko list ki apni copy milti hai.</p>

<h3>Apne checks aur secret values</h3>
<pre class="code">from ipaddress import ip_address

from pydantic import BaseModel, Field, ValidationError, field_validator


class Peer(BaseModel):
    name: str
    ip: str
    asn: int = Field(gt=0, lt=4294967296)

    @field_validator("ip")
    @classmethod
    def must_be_ip(cls, v):
        ip_address(v)
        return v

    @field_validator("name")
    @classmethod
    def tidy(cls, v):
        return v.strip().upper()


print(Peer(name="  isp-a ", ip="203.0.113.1", asn=64500))
try:
    Peer(name="x", ip="203.0.113.999", asn=0)
except ValidationError as err:
    print(err)</pre><pre class="out">AUTO01$ python3 peer.py
name='ISP-A' ip='203.0.113.1' asn=64500
<span class="hl">2 validation errors for Peer</span>
ip
  Value error, '203.0.113.999' does not appear to be an IPv4 or IPv6 address [type=value_error, input_value='203.0.113.999', input_type=str]
    For further information visit ht&#116;ps://errors.pydantic.dev/2.7/v/value_error
asn
  Input should be greater than 0 [type=greater_than, input_value=0, input_type=int]
    For further information visit ht&#116;ps://errors.pydantic.dev/2.7/v/greater_than</pre>
<p><code>field_validator</code> type check ke baad chalta hai. Woh value reject kar sakta hai (impossible IP address) ya saaf kar sakta hai (name ko strip karke upper-case). Lamba message woh hai jo <code>print(err)</code> dikhata hai; <code>errors()</code> list wahi jaankari data ki shakal mein hai.</p>
<pre class="code">from pydantic import BaseModel, SecretStr


class Login(BaseModel):
    user: str
    password: SecretStr


login = Login(user="netops", password="NK@2026")
print(login)
print(repr(login.password), login.password.get_secret_value())
print(login.model_dump_json())</pre><pre class="out">AUTO01$ python3 secret.py
<span class="hl">user='netops' password=SecretStr('**********')</span>
<span class="hl">SecretStr('**********') NK@2026</span>
{"user":"netops","password":"**********"}</pre>
<p><code>SecretStr</code> value ko <code>repr</code>, logs aur <code>model_dump_json()</code> mein chhupata hai; sirf <code>get_secret_value()</code> use dikhata hai. Model mein rehne wale har password ya token ke liye use karo.</p>
<div class="note"><p><b>In the lab vs on real systems.</b> Lab pydantic 2.7 ka pure-Python version chalata hai, wahi error types, messages aur method names ke saath. Asli library mein compiled core aur bahut zyada types hain; "For further information visit ..." wali extra line bhi wahin se aati hai. Is chapter ka kuch bhi asli machine par nahi badalta.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>vlan: Optional[int]</code> likhkar sochna ki field ab optional hai. Pydantic v2 mein woh sirf <code>None</code> ko <i>allow</i> karta hai; default (<code>= None</code>) ke bina field ab bhi required hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Version 2 ke naam: <code>model_dump()</code> (<code>dict()</code> nahi), <code>model_validate()</code> (<code>parse_obj</code> nahi), <code>field_validator</code> (<code>validator</code> nahi), <code>Field(pattern=...)</code> (<code>regex=</code> nahi).</p></div>

<div class="scn"><h4>Description ke andar doosra command</h4><p>Ek change tool ne configuration lines plain string formatting se banayi, bina kisi check ke. Kisi ne spreadsheet se copy ki hui description paste ki; usme line break ke baad <code>shutdown</code> shabd tha. Tool ne dono lines bhej deen aur interface down ho gaya. Field par <code>pattern</code> (letters, digits, space aur kuch separators, line break nahi) request ko kisi device ko chhoone se pehle hi refuse kar deta.</p><p><b>Lesson:</b> model ek security control bhi hai; batao kya allowed hai, yeh nahi ki kya forbidden hai.</p></div>

<div class="iv"><p class="q">"Dictionary ko haath se validate karne ke muqable pydantic kya deta hai?"</p><p>Ek jagah declarative rules, automatic type conversion, aur aisi error report jo har problem ko location aur rule ke saath list karti hai. Wahi model FastAPI ki request parsing, response filter aur OpenAPI document ko feed karta hai. Main yeh bhi kahunga ki woh by default lax hai, isliye jahan silent conversion galti chhupa sakta hai wahan strict mode ya validators lagata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Model typed form hai; <code>Field(...)</code> limits aur patterns jodta hai.</li>
<li><code>ValidationError</code> har problem ko <code>loc</code>, <code>type</code> aur <code>msg</code> ke saath list karta hai.</li>
<li>Pydantic compatible values convert karta hai ("20" se 20) aur baaki reject.</li>
<li><code>field_validator</code> apne rules jodta hai; <code>SecretStr</code> secrets chhupata hai.</li>
<li>Input fields par pattern device configuration mein commands ghusne se rokta hai.</li>
</ul></div>
`}};export{e as default};