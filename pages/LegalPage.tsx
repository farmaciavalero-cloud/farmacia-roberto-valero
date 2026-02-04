import React from 'react';

const LegalPage: React.FC = () => {
    return (
        <div className="p-6 bg-brand-light min-h-full">
            <div className="bg-white p-6 rounded-lg shadow-sm text-gray-700 space-y-6">
                <section>
                    <h2 className="text-xl font-bold text-brand-dark mb-3 border-b-2 border-brand-green pb-2">Aviso Legal</h2>
                    <div className="space-y-4 text-sm">
                        <p>
                            En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio electrónico, FARMACIA ROBERTO VALERO le informa de que es titular del website WWW.ROBERTOVALEROFARMACIA.COM. De acuerdo con la exigencia del artículo 10 de la citada Ley, FARMACIA ROBERTO VALERO informa de los siguientes datos: El titular de esta página web es ROBERTO VALERO MIÑANO con DNI 44761631C y domicilio social en AVDA. REINA VICTORIA 13, 03600 ELDA (ALICANTE). La dirección de correo electrónico de contacto con la empresa es FARMACIAVALERO@GMAIL.COM.
                        </p>
                        <h3 className="font-semibold text-brand-dark">USUARIO Y RÉGIMEN DE RESPONSABILIDADES</h3>
                        <p>
                            La navegación, acceso y uso por el website de FARMACIA ROBERTO VALERO confiere la condición de usuario, por la que se aceptan, desde la navegación por las páginas de FARMACIA ROBERTO VALERO, todas las condiciones de uso aquí establecidas sin perjuicio de la aplicación de la correspondiente normativa de obligado cumplimiento legal según el caso. Las páginas web de FARMACIA ROBERTO VALERO proporcionan gran diversidad de información, servicios y datos. El usuario asume su responsabilidad en el uso correcto del website. Esta responsablidad se extenderá a: La veracidad y licitud de las informaciones aportadas por el usuario en los formularios extendidos por FARMACIA ROBERTO VALERO para el acceso a ciertos contenidos o servicios ofrecidos por las webs. El uso de de la información, servicios y datos ofrecidos por FARMACIA ROBERTO VALERO contrariamente a lo dispuesto por las presentes condiciones, la Ley, la moral, las buenas costumbres o el orden público, o que de cualquier otro modo puedan suponer lesión de los derechos de terceros o del mismo funcionamiento del website.
                        </p>
                    </div>
                </section>
                
                <section>
                    <h2 className="text-xl font-bold text-brand-dark mb-3 border-b-2 border-brand-green pb-2">Política de Privacidad</h2>
                    <div className="space-y-4 text-sm">
                        <p>
                            De conformidad con lo dispuesto en las normativas vigentes en protección de datos personales, el Reglamento (UE) 2016/679 de 27 de abril de 2016 (RGPD) y la Ley Orgánica (ES) 15/1999 de 13 de diciembre (LOPD), le informamos que los datos personales y dirección de correo electrónico del interesado, serán tratados bajo la responsabilidad de FARMACIA ROBERTO VALERO por un interés legítimo y para el envío de comunicaciones sobre nuestros productos y servicios y se conservarán mientras ninguna de las partes se oponga a ello. Los datos no serán comunicados a terceros, salvo obligación legal. Le informamos que puede ejercer los derechos de acceso, rectificación, portabilidad y supresión de sus datos y los de limitación y oposición a su tratamiento dirigiéndose a AVDA. REINA VICTORIA 13, 03600 ELDA (ALICANTE) o enviando un correo electrónico a FARMACIAVALERO@GMAIL.COM. Si considera que el tratamiento no se ajusta a la normativa vigente, podrá presentar una reclamación ante la autoridad de control en www.agpd.es.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default LegalPage;