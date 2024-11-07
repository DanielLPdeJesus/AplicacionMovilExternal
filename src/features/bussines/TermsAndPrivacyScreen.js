import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const TermsAndPrivacyScreen = ({ route }) => {
  const { viewType } = route.params;

  const renderContent = () => {
    if (viewType === 'terms') {
      return (
        <>
          <Text style={styles.mainTitle}>Términos y Condiciones</Text>

          <Text style={styles.section}>Información General</Text>
          <Text style={styles.paragraph}>
            Esta aplicación móvil es operada por JAYDEY S.A. de C.V., con nombre comercial ExternalGlow. En toda la aplicación, los términos "nosotros", "nos" y "nuestro" se refieren a JAYDEY S.A. de C.V. que opera ExternalGlow, ofreciendo información, herramientas y servicios disponibles para ti en esta aplicación. El uso de esta aplicación está condicionado a la aceptación de todos los términos, condiciones, políticas y notificaciones aquí establecidos.
          </Text>

          <Text style={styles.paragraph}>
            Al descargar, instalar o usar esta aplicación y/o comprar servicios desde la aplicación, participas en nuestro "Servicio" y aceptas los términos y condiciones ("Términos de Servicio", "Términos"), incluidos todos los términos adicionales y políticas a los que se hace referencia y/o disponible a través de hipervínculos. Estos Términos se aplican a todos los usuarios de la aplicación, incluyendo navegadores, clientes, y/o colaboradores de contenido.
          </Text>

          <Text style={styles.paragraph}>
            Por favor lee estos Términos cuidadosamente antes de usar la aplicación. Al acceder a cualquier parte de ella, estás aceptando los Términos de Servicio. Si no estás de acuerdo con ellos, no deberías acceder ni utilizar la aplicación.
          </Text>

          <Text style={styles.section}>Sección 1 -- Términos de Uso de la Aplicación</Text>
          <Text style={styles.paragraph}>
            Para utilizar esta aplicación, debes tener al menos la mayoría de edad en tu país de residencia o tener el consentimiento de un tutor. No puedes usar nuestros productos con fines ilegales ni violar ninguna ley al usar el Servicio (incluyendo leyes de derechos de autor). No debes transmitir virus o cualquier código destructivo a través de la aplicación. La violación de cualquiera de estos términos dará lugar al cese inmediato de tus Servicios.
          </Text>

          <Text style={styles.section}>Sección 2 -- Condiciones Generales</Text>
          <Text style={styles.paragraph}>
            Nos reservamos el derecho de rechazar la prestación de servicio a cualquier persona, en cualquier momento. Tu contenido (sin incluir la información de pago) puede ser transferido sin encriptación a través de redes para ajustarse a los requisitos técnicos de conexión de dispositivos móviles. La información de pago siempre está encriptada durante la transferencia. Aceptas no reproducir, duplicar, copiar o explotar ninguna parte del Servicio o contenido de la aplicación sin el permiso por escrito de nuestra parte.
          </Text>

          <Text style={styles.section}>Sección 3 -- Exactitud y Actualidad de la Información</Text>
          <Text style={styles.paragraph}>
            No nos hacemos responsables si la información en esta aplicación no es precisa o completa. El material en esta aplicación es solo para referencia general. Nos reservamos el derecho de modificar contenidos en cualquier momento, y es tu responsabilidad monitorear los cambios.
          </Text>

          <Text style={styles.section}>Sección 4 -- Modificaciones al Servicio y Precios</Text>
          <Text style={styles.paragraph}>
            Los precios de nuestros productos o servicios pueden cambiar sin previo aviso. Nos reservamos el derecho de modificar o discontinuar el Servicio en cualquier momento, sin aviso previo. No somos responsables de ninguna modificación, cambio de precio, suspensión o discontinuidad del Servicio.
          </Text>

          <Text style={styles.section}>Sección 5 -- Productos o Servicios en Línea</Text>
          <Text style={styles.paragraph}>
            Algunos productos o servicios pueden estar disponibles exclusivamente a través de la aplicación. Estos productos o servicios están sujetos a nuestra política de devolución. Nos reservamos el derecho de limitar la venta de productos o servicios a cualquier persona, región o jurisdicción. Las descripciones de los productos o precios están sujetas a cambios sin previo aviso.
          </Text>

          <Text style={styles.section}>Sección 6 -- Exactitud de Facturación e Información de Cuenta</Text>
          <Text style={styles.paragraph}>
            Nos reservamos el derecho de rechazar cualquier pedido o limitar las cantidades compradas. Te comprometes a proporcionar información actual, completa y precisa para las compras realizadas en la aplicación. Es tu responsabilidad actualizar rápidamente tu cuenta y otra información, incluyendo correo electrónico y datos de pago.
          </Text>

          <Text style={styles.section}>Sección 7 -- Herramientas de Terceros</Text>
          <Text style={styles.paragraph}>
            La aplicación puede proporcionarte acceso a herramientas de terceros que no monitoreamos ni controlamos. El uso de estas herramientas es bajo tu propio riesgo y debes asegurarte de conocer los términos aplicables de los proveedores de terceros.
          </Text>

          <Text style={styles.section}>Sección 8 -- Enlaces de Terceros</Text>
          <Text style={styles.paragraph}>
            El Servicio puede incluir enlaces a sitios de terceros. No somos responsables por el contenido de estos sitios ni de cualquier daño relacionado con la adquisición o uso de bienes o servicios de estos sitios. Es tu responsabilidad revisar las políticas y prácticas de terceros antes de realizar transacciones.
          </Text>

          <Text style={styles.section}>Sección 9 -- Comentarios de Usuarios y Otros Envíos</Text>
          <Text style={styles.paragraph}>
            Si envías comentarios, aceptas que podamos, sin restricción, editar, copiar, publicar o utilizar por cualquier medio tus comentarios. No estamos obligados a mantener ningún comentario confidencial ni a responder a ellos. Asegúrate de que tus comentarios no violen derechos de terceros, y que no contienen virus o malware.
          </Text>

          <Text style={styles.section}>Sección 10 -- Información Personal</Text>
          <Text style={styles.paragraph}>
            Tu envío de información personal a través de la aplicación se rige por nuestra Política de Privacidad.
          </Text>

          <Text style={styles.section}>Sección 11 -- Errores e Inexactitudes</Text>
          <Text style={styles.paragraph}>
            Puede haber información en la aplicación que contenga errores o inexactitudes. Nos reservamos el derecho de corregir errores y de cambiar o actualizar la información en cualquier momento sin previo aviso.
          </Text>

          <Text style={styles.section}>Sección 12 -- Usos Prohibidos</Text>
          <Text style={styles.paragraph}>
            No puedes usar la aplicación para propósitos ilícitos, ni violar cualquier ley o normativa. Tampoco puedes enviar contenido que infrinja derechos de propiedad intelectual o que sea ofensivo o dañino.
          </Text>

          <Text style={styles.section}>Sección 13 -- Exclusión de Garantías y Limitación de Responsabilidad</Text>
          <Text style={styles.paragraph}>
            No garantizamos que tu uso de la aplicación será ininterrumpido, seguro o libre de errores. Aceptas que el uso de la aplicación es bajo tu propio riesgo. La aplicación y todos los productos y servicios proporcionados son tal cual y sin garantías de ningún tipo.
          </Text>

          <Text style={styles.section}>Sección 14 -- Indemnización</Text>
          <Text style={styles.paragraph}>
            Aceptas indemnizarnos y mantenernos indemnes ante cualquier reclamo o demanda hecha por terceros debido a tu uso de la aplicación o a la violación de estos Términos.
          </Text>

          <Text style={styles.section}>Sección 15 -- Separación de Cláusulas</Text>
          <Text style={styles.paragraph}>
            En caso de que alguna disposición de estos Términos sea considerada ilegal o inaplicable, esa disposición será eliminada, y las demás disposiciones permanecerán vigentes.
          </Text>

          <Text style={styles.section}>Sección 16 -- Terminación</Text>
          <Text style={styles.paragraph}>
            Podemos dar por terminado el acceso a la aplicación en cualquier momento, sin previo aviso, por violaciones a estos Términos o por otros motivos justificados.
          </Text>

          <Text style={styles.section}>Sección 17 -- Acuerdo Completo</Text>
          <Text style={styles.paragraph}>
            Estos Términos, junto con las políticas mencionadas, constituyen el acuerdo completo entre tú y nosotros y rigen tu uso de la aplicación.
          </Text>

          <Text style={styles.section}>Sección 18 -- Ley Aplicable</Text>
          <Text style={styles.paragraph}>
            Estos Términos se regirán por las leyes aplicables de México. Cualquier disputa será resuelta en los tribunales correspondientes.
          </Text>

          <Text style={styles.section}>Sección 19 -- Cambios en los Términos</Text>
          <Text style={styles.paragraph}>
            Nos reservamos el derecho de actualizar o modificar estos Términos en cualquier momento. Tu uso continuo de la aplicación implica la aceptación de los Términos revisados.
          </Text>

          <Text style={styles.section}>Sección 20 -- Información de Contacto</Text>
          <Text style={styles.paragraph}>
            Las preguntas sobre los Términos de Servicio deben enviarse a nuestro equipo de soporte en jaydeyglow@gmail.com.
          </Text>

          <Text style={styles.section}>Sección 21 -- Derechos de Propiedad Intelectual</Text>
          <Text style={styles.paragraph}>
            Todos los derechos sobre el contenido de la aplicación son propiedad de JAYDEY S.A. de C.V. y están protegidos por las leyes de derechos de autor y propiedad industrial aplicables.
          </Text>

          <Text style={styles.footer}>
            Última actualización: 06/11/2024
          </Text>
        </>
      );
    } else {
      return (
        <>
          <Text style={styles.mainTitle}>Aviso de Privacidad Integral</Text>

          <Text style={styles.paragraph}>
            JAYDEY S.A de C.V mejor conocido como ExternalGlow, con domicilio en C. Segunda Pte. Sur SN, Guadalupe, 29950 Ocosingo, Chiapas, y sitio web http://www.jaydey.com, es responsable del uso y protección de sus datos personales. Le informamos lo siguiente:
          </Text>

          <Text style={styles.section}>Finalidad del Tratamiento de sus Datos Personales</Text>
          <Text style={styles.paragraph}>
            Los datos personales que recopilamos se utilizarán exclusivamente para los siguientes fines necesarios para el servicio que ofrecemos:
          </Text>
          <Text style={styles.bullet}>• Responder a mensajes y solicitudes recibidas a través de nuestro formulario de contacto.</Text>
          <Text style={styles.bullet}>• Proveer acceso y mejorar la experiencia en nuestra aplicación móvil.</Text>

          <Text style={styles.section}>Datos Personales Recabados</Text>
          <Text style={styles.paragraph}>
            Para cumplir con las finalidades descritas, se recabarán los siguientes datos personales:
          </Text>
          <Text style={styles.bullet}>• Nombre</Text>
          <Text style={styles.bullet}>• Fecha de nacimiento</Text>
          <Text style={styles.bullet}>• Número(s) telefónico(s)</Text>
          <Text style={styles.bullet}>• Correo electrónico</Text>
          <Text style={styles.bullet}>• Edad</Text>
          <Text style={styles.bullet}>• Fotografía</Text>

          <Text style={styles.section}>Derechos ARCO</Text>
          <Text style={styles.paragraph}>
            Usted tiene derecho a:
          </Text>
          <Text style={styles.bullet}>• Acceso: Conocer los datos personales que tenemos de usted y el uso que hacemos de ellos.</Text>
          <Text style={styles.bullet}>• Rectificación: Solicitar la corrección de sus datos en caso de que estén incorrectos o incompletos.</Text>
          <Text style={styles.bullet}>• Cancelación: Pedir la eliminación de sus datos de nuestros registros cuando considere que no se usan conforme a este aviso.</Text>
          <Text style={styles.bullet}>• Oposición: Oponerse al uso de sus datos para fines específicos.</Text>

          <Text style={styles.paragraph}>
            Para ejercer estos derechos, envíe una solicitud al correo electrónico: jaydeyglow@gmail.com. La solicitud debe incluir:
          </Text>
          <Text style={styles.bullet}>• Nombre completo</Text>
          <Text style={styles.bullet}>• Domicilio</Text>
          <Text style={styles.bullet}>• Teléfono</Text>
          <Text style={styles.bullet}>• Correo electrónico utilizado en la aplicación</Text>
          <Text style={styles.bullet}>• Copia de una identificación oficial</Text>
          <Text style={styles.bullet}>• Asunto: "Derechos ARCO"</Text>
          <Text style={styles.bullet}>• Descripción clara y precisa de su solicitud</Text>

          <Text style={styles.paragraph}>
            Tiempos de respuesta: Le responderemos en un plazo de 5 días hábiles al correo electrónico desde el cual envió su solicitud.
          </Text>

          <Text style={styles.section}>Uso de Tecnologías de Rastreo</Text>
          <Text style={styles.paragraph}>
            En nuestro sitio web utilizamos cookies y otras tecnologías para mejorar su experiencia de navegación. Los datos obtenidos pueden incluir identificadores, región, búsquedas y preferencias de usuario. Usted puede deshabilitar las cookies en su navegador; sin embargo, hacerlo puede limitar algunas funciones del sitio.
          </Text>

          <Text style={styles.section}>Modificaciones al Aviso de Privacidad</Text>
          <Text style={styles.paragraph}>
            Este Aviso de Privacidad puede ser actualizado por razones legales, necesidades del negocio, o cambios en nuestras prácticas de privacidad. Cualquier modificación será publicada en nuestro sitio web http://www.jaydey.com.
          </Text>

          <Text style={styles.footer}>
            Última actualización: 06/11/2024
          </Text>
        </>
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40, // Aumentado el margen superior
    marginBottom: 30,
    color: '#000',
    textAlign: 'center',
  },
  section: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#000',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
    color: '#333',
    textAlign: 'justify',
  },
  bullet: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 5,
    marginLeft: 15,
    color: '#333',
  },
  footer: {
    fontSize: 14,
    color: '#666',
    marginTop: 30,
    marginBottom: 50,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TermsAndPrivacyScreen;